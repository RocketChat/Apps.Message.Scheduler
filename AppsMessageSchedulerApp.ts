import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';
import {
    IUIKitInteractionHandler,
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { IAppInstallationContext } from '@rocket.chat/apps-engine/definition/accessors';

import { DelayCommand } from './commands/DelayCommand';
import { RemindCommand } from './commands/RemindCommand';
import { cancelFromButton, listMessages, showFullMessage } from './lib/Actions';
import { getUserLanguage, t } from './lib/i18n';
import { getOrCreateDirectRoom, sendAsUser } from './lib/MessageDelivery';
import { notifyUser } from './lib/Notifications';
import { makeSendScheduledMessageProcessor, SEND_MESSAGE_PROCESSOR_ID } from './processors/SendScheduledMessage';

export class AppsMessageSchedulerApp extends App implements IUIKitInteractionHandler {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.settings.provideSetting({
            id: 'max_delay_days',
            type: SettingType.NUMBER,
            packageValue: 30,
            required: false,
            public: false,
            i18nLabel: 'max_delay_days_label',
            i18nDescription: 'max_delay_days_description',
        });

        await configuration.settings.provideSetting({
            id: 'list_snippet_length',
            type: SettingType.NUMBER,
            packageValue: 80,
            required: false,
            public: false,
            i18nLabel: 'list_snippet_length_label',
            i18nDescription: 'list_snippet_length_description',
        });

        await configuration.scheduler.registerProcessors([
            {
                id: SEND_MESSAGE_PROCESSOR_ID,
                processor: makeSendScheduledMessageProcessor(this),
            },
        ]);

        await configuration.slashCommands.provideSlashCommand(new DelayCommand(this));
        await configuration.slashCommands.provideSlashCommand(new RemindCommand(this));
    }

    // welcome the installing admin with a DM from the app bot so the
    // /delay command is discoverable from the moment the app is installed
    public async onInstall(context: IAppInstallationContext, read: IRead, _http: IHttp, _persis: IPersistence, modify: IModify): Promise<void> {
        try {
            const installer = context.user;
            const appUser = await read.getUserReader().getAppUser(this.getID());
            if (!installer || !appUser) {
                return;
            }
            const lang = getUserLanguage(installer);
            const room = await getOrCreateDirectRoom(read, modify, appUser, installer.username);
            await sendAsUser(modify, appUser, room, `${t(lang, 'welcome_install')}\n\n${t(lang, 'help_text')}`);
        } catch (err) {
            this.getLogger().error('Failed to send install welcome DM:', err);
        }
    }

    // handles the [Cancel] [List] [Help] buttons under the schedule confirmation
    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext, read: IRead, _http: IHttp, persis: IPersistence, modify: IModify,
    ): Promise<IUIKitResponse> {
        const data = context.getInteractionData();
        const { actionId, value, user, room } = data;

        if (room) {
            const lang = getUserLanguage(user);
            const notify = (text: string) => notifyUser(this, read, modify, user, room, text);

            if (actionId === 'delay-cancel' && value) {
                await cancelFromButton(this, read, modify, persis, user, room, lang, value);
            } else if (actionId === 'delay-show' && value) {
                await showFullMessage(this, read, modify, user, room, lang, value);
            } else if (actionId === 'delay-list') {
                await listMessages(this, read, modify, user, room, lang);
            } else if (actionId === 'delay-help') {
                await notify(t(lang, 'help_text'));
            }
        }

        return context.getInteractionResponder().successResponse();
    }

    public async onSettingUpdated(setting: ISetting, _configModify: IConfigurationModify, _read: IRead, _http: IHttp): Promise<void> {
        if (setting.id === 'max_delay_days') {
            const days = Number(setting.value);
            if (!Number.isFinite(days) || days < 1 || days > 365) {
                this.getLogger().error(
                    `Invalid value for "Maximum delay (days)": "${setting.value}". ` +
                    `Expected a number between 1 and 365. The default of 30 will be used until this is corrected.`,
                );
            }
        }
        if (setting.id === 'list_snippet_length') {
            const chars = Number(setting.value);
            if (!Number.isFinite(chars) || chars < 20 || chars > 500) {
                this.getLogger().error(
                    `Invalid value for "List snippet length (characters)": "${setting.value}". ` +
                    `Expected a number between 20 and 500. The default of 80 will be used until this is corrected.`,
                );
            }
        }
    }
}
