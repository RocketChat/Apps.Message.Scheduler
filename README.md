# Message Scheduler for Rocket.Chat

A Rocket.Chat app that schedules messages to be sent later, using the `/delay` slash command. Messages are delivered by the native Apps-Engine scheduler and appear as if you sent them yourself at the scheduled time. No REST calls, no external services, and scheduled jobs survive server restarts.

## Usage

Schedule a message to the current channel:

```
/delay 5m say don't forget the standup
/delay 8h30m say the build should be finished by now
/delay 8am tomorrow say morning! please update the spreadsheet
/delay 10am next monday say sprint planning starts in 30 minutes
```

Schedule a direct message by adding one or more @mentions. Mentions and the time expression can appear in any order, as long as they come before the word `say`:

```
/delay @bob 5m say ping me when you are free
/delay 8h @bob @carol say gentle nudge: please review my PR
```

Manage your scheduled messages:

```
/delay list          shows your pending messages with their ids
/delay cancel k3x9q2 cancels one message by id
/delay cancel all    cancels everything you have scheduled
/delay help          shows the built-in help
```

Every successful schedule replies with an ephemeral confirmation showing the id, the resolved delivery time, and how far away it is.

## Time formats

Two styles are supported. They cannot be mixed in one command.

**Relative delays.** Units are `s` (seconds), `m` (minutes), `h` (hours), `d` (days), and `w` (weeks). Units can be combined with or without spaces: `3s`, `5m`, `8h`, `2d`, `1w`, `8h30m`, `1h 30m`.

**Clock times.** A time of day such as `8am`, `10:30pm`, `14:30`, `noon`, or `midnight`, optionally combined with a day: `today`, `tomorrow`, a weekday name (`monday` through `sunday`, abbreviations accepted), or `next` followed by a weekday. A bare time that has already passed today rolls over to tomorrow. A weekday always means the next future occurrence of that day.

Clock times are resolved in your own timezone, taken from your Rocket.Chat profile. If your profile has no timezone set, the server timezone is used and the confirmation message warns you about it.

## Behaviour details

The message text is everything after the word `say`, taken literally. Time-like words inside the message are never parsed, so `/delay 5m say wait 10m before deploying` works as expected.

The app accepts the message text on a new line after `say`, and quoted text keeps its line breaks in the delivered message. Be aware of a Rocket.Chat client limitation, though: when a slash command is typed in the message box, the client discards everything after the first line break before it reaches any app, so a multi-line command typed with Shift+Enter loses its later lines. The app detects the resulting dangling `say` and replies with a hint to keep the command on one line. Commands sent through the REST API (`commands.run`) do not have this limitation.

When one or more users are mentioned, the message is delivered as a direct message to each of them, creating the DM room if it does not exist yet. Without mentions, it is delivered to the channel where the command was typed.

Delivered messages are sent as the scheduling user, not as a bot.

You can only list and cancel your own scheduled messages.

## Settings

| Setting | Default | Description |
| ------- | ------- | ----------- |
| Maximum delay (days) | 30 | The furthest into the future a message may be scheduled, between 1 and 365 days. Invalid values are rejected in the admin log and fall back to 30. |

## Internationalisation

Command metadata and settings are translated through the standard `i18n/*.json` files. Runtime strings (confirmations, errors, help text, the list output) are resolved from the catalog in `lib/i18n.ts` using each user's language preference, with regional variants matched first (`pt-BR` before `pt`) and English as the fallback.

Included languages: English, German, French, Italian, Spanish, Swedish, Portuguese, Brazilian Portuguese, and Japanese. Command keywords (`say`, `tomorrow`, `next monday`, `list`, `cancel`, `help`) are part of the syntax and stay in English in every language. Adding a language means adding one entry to the catalog in `lib/i18n.ts` (including weekday and month names) and one JSON file under `i18n/`.

The `general` key in each JSON file labels the default section on the app's settings page. Rocket.Chat groups settings without an explicit `section` under `general` and translates that name through the app's own i18n files, so without this key the header renders as the raw lowercase string.

## Development

Requirements: Node.js, the [Rocket.Chat Apps CLI](https://developer.rocket.chat/docs/apps-engine-cli) (`@rocket.chat/apps-cli`), and a Rocket.Chat server with development mode enabled.

```bash
npm install
npx tsc --noEmit        # typecheck
rc-apps package         # builds dist/appsmessagescheduler_<version>.zip
rc-apps deploy          # deploys using .rcappsconfig
```

Create a `.rcappsconfig` with your server URL and admin credentials (it is gitignored because it contains plaintext credentials). When deploying to a server with a self-signed certificate, prefix the deploy with `NODE_TLS_REJECT_UNAUTHORIZED=0`.

### Project structure

```
AppsMessageSchedulerApp.ts        app entry point: settings, processor and command registration
commands/DelayCommand.ts          argument parsing, subcommands, scheduling, confirmations
lib/TimeParser.ts                 duration and clock-time parsing with timezone handling
lib/ScheduledMessageStore.ts      persistence records backing list and cancel
lib/MessageDelivery.ts            DM room resolution and send-as-user helper
lib/Notifications.ts              ephemeral notification helper (sent by the app user)
processors/SendScheduledMessage.ts  scheduler processor that delivers the message
lib/i18n.ts                       runtime string catalog (9 languages)
i18n/                             metadata translations
icon.svg                          vector master for icon.png (render at 512px)
```

### App Info page fields

The name, the subtitle under it, and the Description section on the App Info page come from `name`, `shortDescription`, and `description` in `app.json`. `shortDescription` is not part of the documented manifest type, but unknown manifest fields survive packaging and installation, and the admin UI renders it for private apps just as it does for marketplace apps. The Documentation link on the same page cannot be set for a private app; it only exists in marketplace metadata.

### Build requirements

Use apps-cli 1.14.0 or later. Older CLI releases (1.12.x) bundle an apps-compiler that looks for the engine's permission definitions at a path that moved in apps-engine 1.64, so `rc-apps package` fails with `Cannot find module '@rocket.chat/apps-engine/server/permissions/AppPermissions'` whenever `app.json` declares a `permissions` array. The compiler shipped with 1.14.0 handles both paths, and this app declares its permissions explicitly (`slashcommand`, `scheduler`, `persistence`, `message.write`, `room.read`, `room.write`, `user.read`, `server-setting.read`).

`@rocket.chat/apps-engine` stays pinned to an exact version in `package.json` for a different reason: `rc-apps deploy` rewrites `requiredApiVersion` in `app.json` to the exact version of the locally installed engine, so the pin must match the engine version of the target server (currently 1.64.0) or the server rejects the upload.

## Licence

MIT
