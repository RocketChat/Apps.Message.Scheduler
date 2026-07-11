import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IHttp,
    ILogger,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { DelayCommand } from './commands/DelayCommand';
import { makeSendScheduledMessageProcessor, SEND_MESSAGE_PROCESSOR_ID } from './processors/SendScheduledMessage';

export class AppsMessageSchedulerApp extends App {
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

        await configuration.scheduler.registerProcessors([
            {
                id: SEND_MESSAGE_PROCESSOR_ID,
                processor: makeSendScheduledMessageProcessor(this),
            },
        ]);

        await configuration.slashCommands.provideSlashCommand(new DelayCommand(this));
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
    }
}
