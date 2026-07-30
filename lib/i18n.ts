import { IUser } from '@rocket.chat/apps-engine/definition/users';

/**
 * Runtime string catalog. The Apps-Engine only auto-translates static
 * metadata (command description, setting labels) from the i18n/*.json
 * files; strings composed at runtime must be resolved by the app
 * itself, so the catalog lives here and i18n/*.json mirrors it.
 *
 * Command keywords (say, tomorrow, next monday, list, cancel, help) are
 * part of the syntax and stay in English in every language.
 */
type Catalog = Record<string, Record<string, string>>;

const strings: Catalog = {
    en: {
        confirm_scheduled: '✅ Scheduled: will send {target} at *{when}* ({relative}). Message ID: `{id}`',
        confirm_target_room: 'to this channel',
        confirm_target_dm: 'a direct message to {users}',
        confirm_target_channels: 'to {channels}',
        confirm_target_reminder: 'as a reminder to you',
        confirm_scheduled_recurring: '✅ Scheduled *{recurrence}*: will send {target}, next on *{next}*. Message ID: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · next {next} · {target}',
        recur_daily: 'every day at {time}',
        recur_weekdays: 'every weekday at {time}',
        recur_weekly: 'every {weekday} at {time}',
        err_recur_unsupported: 'Repeats need a day and a time, e.g. `every day at 8am`, `every weekday at 9am` or `every monday at 8am`.',
        err_recur_limit: 'You already have {max} repeating schedules, the limit set by the admin. Cancel one first.',
        err_recur_disabled: 'Repeating messages are turned off on this workspace.',
        recur_cancelled_access: '🔁 Your repeating message `{id}` was cancelled because you no longer have access to {target}.',
        remind_delivery: '⏰ Reminder: {text}',
        remind_help_text:
            '*Personal reminders (`/remind`)*\n' +
            'The app will remind you by direct message at the chosen time. The word `say` is required.\n\n' +
            '• `/remind 20m say check the oven`\n' +
            '• `/remind 8am tomorrow say submit the report`\n\n' +
            '*Repeat a reminder:* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Manage:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'Channel #{name} was not found on this server.',
        err_not_channel_member: 'You are not a member of #{name}.',
        tz_warning: '⚠️ Your profile has no timezone set, so *server time* was used to resolve the time.',
        err_no_message: 'Nothing to send. Put the message after the word `say`, e.g. `/{cmd} 5m say hello`.',
        err_say_no_text: 'Nothing to send after `say`. Keep the whole command on one line: Rocket.Chat discards slash command text after a line break.',
        err_no_time: 'No time found. Use a delay like `5m`, `8h30m`, or a time like `8am tomorrow`, `10am next monday`.',
        err_seconds_unsupported: 'Seconds are not supported. The smallest delay is a minute, e.g. `1m` or `8h30m`.',
        err_unknown_token: 'Could not understand `{token}`. Type `/{cmd} help` for the accepted formats.',
        err_mixed_time: 'Mixing a relative delay (like `5m`) with a clock time (like `8am tomorrow`) is not supported. Use one or the other.',
        err_need_time_of_day: 'Please include a time of day, e.g. `8am tomorrow` or `next monday 14:30`.',
        err_past: 'That time is in the past. Pick a future time.',
        err_too_far: 'That is more than {days} days away (the admin limit for this app).',
        err_user_not_found: 'User `@{username}` was not found on this server.',
        err_schedule_failed: 'Scheduling failed. Check the app logs.',
        list_header: '📋 Your scheduled messages:',
        btn_cancel: 'Cancel',
        btn_list: 'List',
        btn_help: 'Help',
        btn_show: 'Show',
        welcome_install: '👋 Thanks for installing Message Scheduler! Here is how it works:',
        list_empty: 'You have no scheduled messages.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'to {name}',
        list_target_dm_room: 'to the direct message with {users}',
        list_target_gone: 'to a room that no longer exists',
        cancel_usage: 'Usage: `/{cmd} cancel <id>` or `/{cmd} cancel all` (get ids from `/{cmd} list`).',
        cancel_not_found: 'No scheduled message with id `{id}` found (it may have already been sent).',
        cancel_done: '🗑️ Scheduled message `{id}` cancelled.',
        cancel_all_done: '🗑️ Cancelled {count} scheduled message(s).',
        relative_in: 'in {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Schedule a message to be sent later, as you.\n' +
            'The word `say` is required. Everything before it sets the time and targets, everything after it is sent as the message.\n\n' +
            '*Send to the current channel:*\n' +
            '• `/delay 5m say don\'t forget the standup`\n' +
            '• `/delay 1h30m say build should be done now`\n' +
            '• `/delay 8am tomorrow say morning! update the spreadsheet`\n' +
            '• `/delay 10am next monday say sprint planning in 30 minutes`\n\n' +
            '*Send to other channels:* add one or more #channels (before `say`, any order):\n' +
            '• `/delay 10m #announcements say maintenance window starts soon`\n\n' +
            '*Send as a direct message:* add one or more @mentions (before `say`, any order):\n' +
            '• `/delay @bob 5m say ping me when free`\n' +
            '• `/delay 8h @bob @carol say nudge: review my PR`\n\n' +
            '*Repeat a message:* start with `every` and give a day and a time:\n' +
            '• `/delay every day at 8am say daily standup starts soon`\n' +
            '• `/delay every weekday at 9am #team say morning check-in`\n' +
            '• `/delay every monday at 8am say check your weekly tasks`\n' +
            'Repeats run until you cancel them, and `/delay list` shows the next run.\n\n' +
            '*Time formats:* delays `5m` `8h` `2d` `1w` and combos `8h30m`; clock times `8am`, `14:30`, `noon`, `midnight` with `today`, `tomorrow`, a weekday, or `next <weekday>`.\n' +
            'Clock times use *your* timezone (profile setting).\n\n' +
            '*Manage:*\n' +
            '• `/delay list`: your pending messages\n' +
            '• `/delay cancel <id>`: cancel one (id shown at scheduling and in list)\n' +
            '• `/delay cancel all`: cancel all yours',
    },
    de: {
        confirm_scheduled: '✅ Geplant: wird {target} um *{when}* gesendet ({relative}). Nachrichten-ID: `{id}`',
        confirm_target_room: 'in diesen Kanal',
        confirm_target_dm: 'als Direktnachricht an {users}',
        confirm_target_channels: 'in {channels}',
        confirm_target_reminder: 'als Erinnerung an dich',
        confirm_scheduled_recurring: '✅ Geplant *{recurrence}*: wird {target} gesendet, nächstes Mal am *{next}*. Nachrichten-ID: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · nächstes Mal {next} · {target}',
        recur_daily: 'täglich um {time}',
        recur_weekdays: 'an jedem Wochentag um {time}',
        recur_weekly: 'jeden {weekday} um {time}',
        err_recur_unsupported: 'Wiederholungen brauchen einen Tag und eine Uhrzeit, z. B. `every day at 8am`, `every weekday at 9am` oder `every monday at 8am`.',
        err_recur_limit: 'Du hast bereits {max} wiederkehrende Zeitpläne, das vom Admin gesetzte Limit. Storniere zuerst einen.',
        err_recur_disabled: 'Wiederkehrende Nachrichten sind in diesem Workspace deaktiviert.',
        recur_cancelled_access: '🔁 Deine wiederkehrende Nachricht `{id}` wurde storniert, weil du keinen Zugriff mehr auf {target} hast.',
        remind_delivery: '⏰ Erinnerung: {text}',
        remind_help_text:
            '*Persönliche Erinnerungen (`/remind`)*\n' +
            'Die App erinnert dich zur gewählten Zeit per Direktnachricht. Das Wort `say` ist erforderlich.\n\n' +
            '• `/remind 20m say Ofen prüfen`\n' +
            '• `/remind 8am tomorrow say Bericht abgeben`\n\n' +
            '*Erinnerung wiederholen:* `/remind every weekday at 9am say Stand-up`\n\n' +
            '*Verwalten:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'Der Kanal #{name} wurde auf diesem Server nicht gefunden.',
        err_not_channel_member: 'Du bist kein Mitglied von #{name}.',
        tz_warning: '⚠️ In deinem Profil ist keine Zeitzone gesetzt, daher wurde die *Serverzeit* verwendet.',
        err_no_message: 'Keine Nachricht angegeben. Schreibe die Nachricht nach dem Wort `say`, z. B. `/{cmd} 5m say hallo`.',
        err_say_no_text: 'Nach `say` folgt kein Text. Schreibe den gesamten Befehl in eine Zeile: Rocket.Chat verwirft bei Slash-Befehlen den Text nach einem Zeilenumbruch.',
        err_no_time: 'Keine Zeitangabe gefunden. Nutze eine Verzögerung wie `5m`, `8h30m` oder eine Uhrzeit wie `8am tomorrow`.',
        err_seconds_unsupported: 'Sekunden werden nicht unterstützt. Die kleinste Verzögerung ist eine Minute, z. B. `1m` oder `8h30m`.',
        err_unknown_token: '`{token}` wurde nicht verstanden. Tippe `/{cmd} help` für die gültigen Formate.',
        err_mixed_time: 'Eine relative Verzögerung (`5m`) und eine Uhrzeit (`8am tomorrow`) können nicht kombiniert werden.',
        err_need_time_of_day: 'Bitte eine Uhrzeit angeben, z. B. `8am tomorrow` oder `next monday 14:30`.',
        err_past: 'Dieser Zeitpunkt liegt in der Vergangenheit.',
        err_too_far: 'Das ist mehr als {days} Tage entfernt (das Admin-Limit dieser App).',
        err_user_not_found: 'Benutzer `@{username}` wurde nicht gefunden.',
        err_schedule_failed: 'Planung fehlgeschlagen. Bitte App-Logs prüfen.',
        list_header: '📋 Deine geplanten Nachrichten:',
        btn_cancel: 'Stornieren',
        btn_list: 'Liste',
        btn_help: 'Hilfe',
        btn_show: 'Anzeigen',
        welcome_install: '👋 Danke für die Installation von Message Scheduler! So funktioniert es:',
        list_empty: 'Du hast keine geplanten Nachrichten.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'in {name}',
        list_target_dm_room: 'in die Direktnachricht mit {users}',
        list_target_gone: 'in einen nicht mehr existierenden Raum',
        cancel_usage: 'Nutzung: `/{cmd} cancel <id>` oder `/{cmd} cancel all` (IDs via `/{cmd} list`).',
        cancel_not_found: 'Keine geplante Nachricht mit ID `{id}` gefunden (evtl. bereits gesendet).',
        cancel_done: '🗑️ Geplante Nachricht `{id}` storniert.',
        cancel_all_done: '🗑️ {count} geplante Nachricht(en) storniert.',
        relative_in: 'in {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Plane eine Nachricht, die später in deinem Namen gesendet wird.\n' +
            'Das Wort `say` ist erforderlich. Alles davor bestimmt Zeit und Ziele, alles danach wird als Nachricht gesendet.\n\n' +
            '*In den aktuellen Kanal:*\n' +
            '• `/delay 5m say Standup nicht vergessen`\n' +
            '• `/delay 8am tomorrow say Guten Morgen! Tabelle aktualisieren`\n\n' +
            '*In andere Kanäle:* #Kanäle vor `say` hinzufügen (Reihenfolge egal):\n' +
            '• `/delay 10m #announcements say Wartungsfenster beginnt bald`\n\n' +
            '*Als Direktnachricht:* @Erwähnungen vor `say` hinzufügen (Reihenfolge egal):\n' +
            '• `/delay @bob 5m say melde dich, wenn du frei bist`\n\n' +
            '*Nachricht wiederholen:* beginne mit `every` und gib Tag und Uhrzeit an:\n' +
            '• `/delay every day at 8am say Standup beginnt bald`\n' +
            '• `/delay every weekday at 9am #team say Morgen-Check-in`\n' +
            '• `/delay every monday at 8am say Wochenaufgaben prüfen`\n' +
            'Wiederholungen laufen bis zur Stornierung, `/delay list` zeigt den nächsten Termin.\n\n' +
            '*Zeitformate:* Verzögerungen `5m` `8h` `2d` `1w`, Kombis `8h30m`; Uhrzeiten `8am`, `14:30`, `noon`, `midnight` mit `today`, `tomorrow`, Wochentag oder `next <Wochentag>`.\n' +
            'Uhrzeiten nutzen *deine* Zeitzone (Profileinstellung).\n\n' +
            '*Verwalten:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    fr: {
        confirm_scheduled: '✅ Planifié : sera envoyé {target} à *{when}* ({relative}). ID du message : `{id}`',
        confirm_target_room: 'dans ce canal',
        confirm_target_dm: 'en message direct à {users}',
        confirm_target_channels: 'vers {channels}',
        confirm_target_reminder: 'comme rappel pour vous',
        confirm_scheduled_recurring: '✅ Planifié *{recurrence}* : sera envoyé {target}, prochaine fois le *{next}*. ID du message : `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · prochaine fois {next} · {target}',
        recur_daily: 'chaque jour à {time}',
        recur_weekdays: 'chaque jour de semaine à {time}',
        recur_weekly: 'chaque {weekday} à {time}',
        err_recur_unsupported: 'Une répétition demande un jour et une heure, ex. `every day at 8am`, `every weekday at 9am` ou `every monday at 8am`.',
        err_recur_limit: 'Vous avez déjà {max} planifications récurrentes, la limite fixée par l\'administrateur. Annulez-en une d\'abord.',
        err_recur_disabled: 'Les messages récurrents sont désactivés sur cet espace de travail.',
        recur_cancelled_access: '🔁 Votre message récurrent `{id}` a été annulé car vous n\'avez plus accès à {target}.',
        remind_delivery: '⏰ Rappel : {text}',
        remind_help_text:
            '*Rappels personnels (`/remind`)*\n' +
            'L\'app vous rappelle par message direct à l\'heure choisie. Le mot `say` est obligatoire.\n\n' +
            '• `/remind 20m say vérifier le four`\n' +
            '• `/remind 8am tomorrow say envoyer le rapport`\n\n' +
            '*Répéter un rappel :* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Gérer :* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'Le canal #{name} est introuvable sur ce serveur.',
        err_not_channel_member: 'Vous n\'êtes pas membre de #{name}.',
        tz_warning: '⚠️ Aucun fuseau horaire dans votre profil : l\'heure du *serveur* a été utilisée.',
        err_no_message: 'Aucun message à envoyer. Placez le message après le mot `say`, ex. `/{cmd} 5m say bonjour`.',
        err_say_no_text: 'Aucun texte après `say`. Gardez toute la commande sur une seule ligne : Rocket.Chat ignore le texte des commandes slash après un saut de ligne.',
        err_no_time: 'Aucune indication de temps. Utilisez un délai comme `5m`, `8h30m` ou une heure comme `8am tomorrow`.',
        err_seconds_unsupported: 'Les secondes ne sont pas prises en charge. Le délai minimal est d\'une minute, ex. `1m` ou `8h30m`.',
        err_unknown_token: '`{token}` non compris. Tapez `/{cmd} help` pour les formats acceptés.',
        err_mixed_time: 'Impossible de combiner un délai relatif (`5m`) et une heure (`8am tomorrow`).',
        err_need_time_of_day: 'Veuillez préciser une heure, ex. `8am tomorrow` ou `next monday 14:30`.',
        err_past: 'Cette heure est déjà passée.',
        err_too_far: 'C\'est à plus de {days} jours (limite fixée par l\'administrateur).',
        err_user_not_found: 'Utilisateur `@{username}` introuvable.',
        err_schedule_failed: 'Échec de la planification. Consultez les logs de l\'app.',
        list_header: '📋 Vos messages planifiés :',
        btn_cancel: 'Annuler',
        btn_list: 'Liste',
        btn_help: 'Aide',
        btn_show: 'Afficher',
        welcome_install: '👋 Merci d\'avoir installé Message Scheduler ! Voici comment ça marche :',
        list_empty: 'Vous n\'avez aucun message planifié.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'vers {name}',
        list_target_dm_room: 'vers le message direct avec {users}',
        list_target_gone: 'vers un salon qui n\'existe plus',
        cancel_usage: 'Usage : `/{cmd} cancel <id>` ou `/{cmd} cancel all` (ids via `/{cmd} list`).',
        cancel_not_found: 'Aucun message planifié avec l\'id `{id}` (peut-être déjà envoyé).',
        cancel_done: '🗑️ Message planifié `{id}` annulé.',
        cancel_all_done: '🗑️ {count} message(s) planifié(s) annulé(s).',
        relative_in: 'dans {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Planifiez un message envoyé plus tard, en votre nom.\n' +
            'Le mot `say` est obligatoire. Tout ce qui précède définit l\'heure et les destinataires, tout ce qui suit est envoyé comme message.\n\n' +
            '*Dans le canal courant :*\n' +
            '• `/delay 5m say n\'oubliez pas le standup`\n' +
            '• `/delay 8am tomorrow say pensez à mettre à jour le tableur`\n\n' +
            '*Vers d\'autres canaux :* ajoutez des #canaux avant `say` (ordre libre) :\n' +
            '• `/delay 10m #announcements say la maintenance commence bientôt`\n\n' +
            '*En message direct :* ajoutez des @mentions avant `say` (ordre libre) :\n' +
            '• `/delay @bob 5m say ping quand tu es libre`\n\n' +
            '*Répéter un message :* commencez par `every` avec un jour et une heure :\n' +
            '• `/delay every day at 8am say le standup commence bientôt`\n' +
            '• `/delay every weekday at 9am #team say point du matin`\n' +
            '• `/delay every monday at 8am say vérifiez vos tâches de la semaine`\n' +
            'Les répétitions durent jusqu\'à annulation, `/delay list` montre la prochaine.\n\n' +
            '*Formats :* délais `5m` `8h` `2d` `1w`, combinés `8h30m` ; heures `8am`, `14:30`, `noon`, `midnight` avec `today`, `tomorrow`, un jour de semaine ou `next <jour>`.\n' +
            'Les heures utilisent *votre* fuseau (profil).\n\n' +
            '*Gérer :* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    it: {
        confirm_scheduled: '✅ Pianificato: sarà inviato {target} alle *{when}* ({relative}). ID del messaggio: `{id}`',
        confirm_target_room: 'in questo canale',
        confirm_target_dm: 'come messaggio diretto a {users}',
        confirm_target_channels: 'in {channels}',
        confirm_target_reminder: 'come promemoria per te',
        confirm_scheduled_recurring: '✅ Pianificato *{recurrence}*: sarà inviato {target}, prossima volta il *{next}*. ID del messaggio: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · prossima volta {next} · {target}',
        recur_daily: 'ogni giorno alle {time}',
        recur_weekdays: 'ogni giorno lavorativo alle {time}',
        recur_weekly: 'ogni {weekday} alle {time}',
        err_recur_unsupported: 'Le ripetizioni richiedono un giorno e un orario, es. `every day at 8am`, `every weekday at 9am` o `every monday at 8am`.',
        err_recur_limit: 'Hai già {max} pianificazioni ricorrenti, il limite impostato dall\'amministratore. Annullane una prima.',
        err_recur_disabled: 'I messaggi ricorrenti sono disattivati in questo workspace.',
        recur_cancelled_access: '🔁 Il tuo messaggio ricorrente `{id}` è stato annullato perché non hai più accesso a {target}.',
        remind_delivery: '⏰ Promemoria: {text}',
        remind_help_text:
            '*Promemoria personali (`/remind`)*\n' +
            'L\'app ti ricorda con un messaggio diretto all\'ora scelta. La parola `say` è obbligatoria.\n\n' +
            '• `/remind 20m say controlla il forno`\n' +
            '• `/remind 8am tomorrow say invia il rapporto`\n\n' +
            '*Ripetere un promemoria:* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Gestione:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'Il canale #{name} non è stato trovato su questo server.',
        err_not_channel_member: 'Non sei membro di #{name}.',
        tz_warning: '⚠️ Il tuo profilo non ha un fuso orario impostato, quindi è stato usato l\'orario del *server*.',
        err_no_message: 'Nessun messaggio da inviare. Scrivi il messaggio dopo la parola `say`, es. `/{cmd} 5m say ciao`.',
        err_say_no_text: 'Nessun testo dopo `say`. Tieni l\'intero comando su una sola riga: Rocket.Chat scarta il testo dei comandi slash dopo un ritorno a capo.',
        err_no_time: 'Nessuna indicazione di tempo. Usa un ritardo come `5m`, `8h30m` o un orario come `8am tomorrow`.',
        err_seconds_unsupported: 'I secondi non sono supportati. Il ritardo minimo è di un minuto, es. `1m` o `8h30m`.',
        err_unknown_token: '`{token}` non riconosciuto. Digita `/{cmd} help` per i formati accettati.',
        err_mixed_time: 'Non è possibile combinare un ritardo relativo (`5m`) con un orario (`8am tomorrow`). Usane uno solo.',
        err_need_time_of_day: 'Indica un orario, es. `8am tomorrow` o `next monday 14:30`.',
        err_past: 'Quell\'orario è già passato. Scegli un orario futuro.',
        err_too_far: 'Sono più di {days} giorni (il limite impostato dall\'amministratore).',
        err_user_not_found: 'Utente `@{username}` non trovato su questo server.',
        err_schedule_failed: 'Pianificazione non riuscita. Controlla i log dell\'app.',
        list_header: '📋 I tuoi messaggi pianificati:',
        btn_cancel: 'Annulla',
        btn_list: 'Elenco',
        btn_help: 'Aiuto',
        btn_show: 'Mostra',
        welcome_install: '👋 Grazie per aver installato Message Scheduler! Ecco come funziona:',
        list_empty: 'Non hai messaggi pianificati.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'in {name}',
        list_target_dm_room: 'nel messaggio diretto con {users}',
        list_target_gone: 'in una stanza che non esiste più',
        cancel_usage: 'Uso: `/{cmd} cancel <id>` oppure `/{cmd} cancel all` (gli id sono in `/{cmd} list`).',
        cancel_not_found: 'Nessun messaggio pianificato con id `{id}` (forse è già stato inviato).',
        cancel_done: '🗑️ Messaggio pianificato `{id}` annullato.',
        cancel_all_done: '🗑️ Annullati {count} messaggi pianificati.',
        relative_in: 'tra {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Pianifica un messaggio da inviare più tardi, a tuo nome.\n' +
            'La parola `say` è obbligatoria. Tutto ciò che la precede definisce orario e destinatari, tutto ciò che segue viene inviato come messaggio.\n\n' +
            '*Nel canale corrente:*\n' +
            '• `/delay 5m say non dimenticare lo standup`\n' +
            '• `/delay 8am tomorrow say buongiorno! aggiorna il foglio di calcolo`\n\n' +
            '*In altri canali:* aggiungi uno o più #canali prima di `say` (in qualsiasi ordine):\n' +
            '• `/delay 10m #announcements say la manutenzione inizia a breve`\n\n' +
            '*Come messaggio diretto:* aggiungi una o più @menzioni prima di `say` (in qualsiasi ordine):\n' +
            '• `/delay @bob 5m say scrivimi quando sei libero`\n\n' +
            '*Ripetere un messaggio:* inizia con `every` indicando giorno e orario:\n' +
            '• `/delay every day at 8am say lo standup inizia a breve`\n' +
            '• `/delay every weekday at 9am #team say check-in del mattino`\n' +
            '• `/delay every monday at 8am say controlla le attività della settimana`\n' +
            'Le ripetizioni continuano fino all\'annullamento, `/delay list` mostra la prossima.\n\n' +
            '*Formati:* ritardi `5m` `8h` `2d` `1w`, combinati `8h30m`; orari `8am`, `14:30`, `noon`, `midnight` con `today`, `tomorrow`, un giorno della settimana o `next <giorno>`.\n' +
            'Gli orari usano il *tuo* fuso orario (impostazione del profilo).\n\n' +
            '*Gestione:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    es: {
        confirm_scheduled: '✅ Programado: se enviará {target} a las *{when}* ({relative}). ID del mensaje: `{id}`',
        confirm_target_room: 'a este canal',
        confirm_target_dm: 'como mensaje directo a {users}',
        confirm_target_channels: 'a {channels}',
        confirm_target_reminder: 'como recordatorio para ti',
        confirm_scheduled_recurring: '✅ Programado *{recurrence}*: se enviará {target}, la próxima vez el *{next}*. ID del mensaje: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · próxima vez {next} · {target}',
        recur_daily: 'todos los días a las {time}',
        recur_weekdays: 'cada día laborable a las {time}',
        recur_weekly: 'cada {weekday} a las {time}',
        err_recur_unsupported: 'Las repeticiones necesitan un día y una hora, p. ej. `every day at 8am`, `every weekday at 9am` o `every monday at 8am`.',
        err_recur_limit: 'Ya tienes {max} programaciones periódicas, el límite fijado por el administrador. Cancela una primero.',
        err_recur_disabled: 'Los mensajes periódicos están desactivados en este espacio de trabajo.',
        recur_cancelled_access: '🔁 Tu mensaje periódico `{id}` se canceló porque ya no tienes acceso a {target}.',
        remind_delivery: '⏰ Recordatorio: {text}',
        remind_help_text:
            '*Recordatorios personales (`/remind`)*\n' +
            'La app te recuerda por mensaje directo a la hora elegida. La palabra `say` es obligatoria.\n\n' +
            '• `/remind 20m say revisa el horno`\n' +
            '• `/remind 8am tomorrow say envía el informe`\n\n' +
            '*Repetir un recordatorio:* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Gestión:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'El canal #{name} no se encontró en este servidor.',
        err_not_channel_member: 'No eres miembro de #{name}.',
        tz_warning: '⚠️ Tu perfil no tiene zona horaria configurada, así que se usó la hora del *servidor*.',
        err_no_message: 'No hay nada que enviar. Escribe el mensaje después de la palabra `say`, p. ej. `/{cmd} 5m say hola`.',
        err_say_no_text: 'No hay texto después de `say`. Mantén todo el comando en una sola línea: Rocket.Chat descarta el texto de los comandos de barra después de un salto de línea.',
        err_no_time: 'No se encontró ninguna indicación de tiempo. Usa un retraso como `5m`, `8h30m` o una hora como `8am tomorrow`.',
        err_seconds_unsupported: 'Los segundos no son compatibles. El retraso mínimo es un minuto, p. ej. `1m` u `8h30m`.',
        err_unknown_token: 'No se entendió `{token}`. Escribe `/{cmd} help` para ver los formatos aceptados.',
        err_mixed_time: 'No se puede combinar un retraso relativo (`5m`) con una hora (`8am tomorrow`). Usa solo uno.',
        err_need_time_of_day: 'Incluye una hora del día, p. ej. `8am tomorrow` o `next monday 14:30`.',
        err_past: 'Esa hora ya pasó. Elige una hora futura.',
        err_too_far: 'Eso está a más de {days} días (el límite del administrador).',
        err_user_not_found: 'No se encontró al usuario `@{username}` en este servidor.',
        err_schedule_failed: 'La programación falló. Revisa los logs de la app.',
        list_header: '📋 Tus mensajes programados:',
        btn_cancel: 'Cancelar',
        btn_list: 'Lista',
        btn_help: 'Ayuda',
        btn_show: 'Mostrar',
        welcome_install: '👋 ¡Gracias por instalar Message Scheduler! Así funciona:',
        list_empty: 'No tienes mensajes programados.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'a {name}',
        list_target_dm_room: 'al mensaje directo con {users}',
        list_target_gone: 'a una sala que ya no existe',
        cancel_usage: 'Uso: `/{cmd} cancel <id>` o `/{cmd} cancel all` (los ids aparecen en `/{cmd} list`).',
        cancel_not_found: 'No hay ningún mensaje programado con id `{id}` (quizá ya fue enviado).',
        cancel_done: '🗑️ Mensaje programado `{id}` cancelado.',
        cancel_all_done: '🗑️ {count} mensaje(s) programado(s) cancelado(s).',
        relative_in: 'en {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Programa un mensaje para enviarlo más tarde, en tu nombre.\n' +
            'La palabra `say` es obligatoria. Todo lo anterior define la hora y los destinatarios, todo lo posterior se envía como mensaje.\n\n' +
            '*Al canal actual:*\n' +
            '• `/delay 5m say no olvides el standup`\n' +
            '• `/delay 8am tomorrow say ¡buenos días! actualiza la hoja de cálculo`\n\n' +
            '*A otros canales:* añade uno o más #canales antes de `say` (en cualquier orden):\n' +
            '• `/delay 10m #announcements say el mantenimiento empieza pronto`\n\n' +
            '*Como mensaje directo:* añade una o más @menciones antes de `say` (en cualquier orden):\n' +
            '• `/delay @bob 5m say avísame cuando estés libre`\n\n' +
            '*Repetir un mensaje:* empieza con `every` e indica día y hora:\n' +
            '• `/delay every day at 8am say el standup empieza pronto`\n' +
            '• `/delay every weekday at 9am #team say revisión de la mañana`\n' +
            '• `/delay every monday at 8am say revisa tus tareas de la semana`\n' +
            'Las repeticiones siguen hasta que las canceles, `/delay list` muestra la próxima.\n\n' +
            '*Formatos:* retrasos `5m` `8h` `2d` `1w` y combinados `8h30m`; horas `8am`, `14:30`, `noon`, `midnight` con `today`, `tomorrow`, un día de la semana o `next <día>`.\n' +
            'Las horas usan *tu* zona horaria (ajuste del perfil).\n\n' +
            '*Gestión:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    sv: {
        confirm_scheduled: '✅ Schemalagt: skickas {target} kl. *{when}* ({relative}). Meddelande-ID: `{id}`',
        confirm_target_room: 'till den här kanalen',
        confirm_target_dm: 'som direktmeddelande till {users}',
        confirm_target_channels: 'till {channels}',
        confirm_target_reminder: 'som en påminnelse till dig',
        confirm_scheduled_recurring: '✅ Schemalagt *{recurrence}*: skickas {target}, nästa gång *{next}*. Meddelande-ID: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · nästa gång {next} · {target}',
        recur_daily: 'varje dag kl. {time}',
        recur_weekdays: 'varje vardag kl. {time}',
        recur_weekly: 'varje {weekday} kl. {time}',
        err_recur_unsupported: 'Upprepningar behöver en dag och en tid, t.ex. `every day at 8am`, `every weekday at 9am` eller `every monday at 8am`.',
        err_recur_limit: 'Du har redan {max} återkommande scheman, gränsen som administratören satt. Avbryt ett först.',
        err_recur_disabled: 'Återkommande meddelanden är avstängda i den här arbetsytan.',
        recur_cancelled_access: '🔁 Ditt återkommande meddelande `{id}` avbröts eftersom du inte längre har åtkomst till {target}.',
        remind_delivery: '⏰ Påminnelse: {text}',
        remind_help_text:
            '*Personliga påminnelser (`/remind`)*\n' +
            'Appen påminner dig via direktmeddelande vid vald tid. Ordet `say` är obligatoriskt.\n\n' +
            '• `/remind 20m say kolla ugnen`\n' +
            '• `/remind 8am tomorrow say lämna in rapporten`\n\n' +
            '*Upprepa en påminnelse:* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Hantera:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'Kanalen #{name} hittades inte på den här servern.',
        err_not_channel_member: 'Du är inte medlem i #{name}.',
        tz_warning: '⚠️ Din profil saknar tidszon, så *serverns* tid användes.',
        err_no_message: 'Inget att skicka. Skriv meddelandet efter ordet `say`, t.ex. `/{cmd} 5m say hej`.',
        err_say_no_text: 'Ingen text efter `say`. Håll hela kommandot på en rad: Rocket.Chat kastar bort text efter en radbrytning i snedstreckskommandon.',
        err_no_time: 'Ingen tidsangivelse hittades. Använd en fördröjning som `5m`, `8h30m` eller en tid som `8am tomorrow`.',
        err_seconds_unsupported: 'Sekunder stöds inte. Kortaste fördröjningen är en minut, t.ex. `1m` eller `8h30m`.',
        err_unknown_token: 'Förstod inte `{token}`. Skriv `/{cmd} help` för giltiga format.',
        err_mixed_time: 'Det går inte att blanda en relativ fördröjning (`5m`) med en klocktid (`8am tomorrow`). Välj en av dem.',
        err_need_time_of_day: 'Ange en tid på dygnet, t.ex. `8am tomorrow` eller `next monday 14:30`.',
        err_past: 'Den tiden har redan passerat. Välj en framtida tid.',
        err_too_far: 'Det är mer än {days} dagar bort (administratörens gräns för appen).',
        err_user_not_found: 'Användaren `@{username}` hittades inte på den här servern.',
        err_schedule_failed: 'Schemaläggningen misslyckades. Kontrollera appens loggar.',
        list_header: '📋 Dina schemalagda meddelanden:',
        btn_cancel: 'Avbryt',
        btn_list: 'Lista',
        btn_help: 'Hjälp',
        btn_show: 'Visa',
        welcome_install: '👋 Tack för att du installerade Message Scheduler! Så här fungerar det:',
        list_empty: 'Du har inga schemalagda meddelanden.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'till {name}',
        list_target_dm_room: 'till direktmeddelandet med {users}',
        list_target_gone: 'till ett rum som inte längre finns',
        cancel_usage: 'Användning: `/{cmd} cancel <id>` eller `/{cmd} cancel all` (id:n visas i `/{cmd} list`).',
        cancel_not_found: 'Inget schemalagt meddelande med id `{id}` hittades (det kan redan ha skickats).',
        cancel_done: '🗑️ Schemalagt meddelande `{id}` avbrutet.',
        cancel_all_done: '🗑️ {count} schemalagda meddelande(n) avbrutna.',
        relative_in: 'om {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Schemalägg ett meddelande som skickas senare, i ditt namn.\n' +
            'Ordet `say` är obligatoriskt. Allt före anger tid och mottagare, allt efter skickas som meddelandet.\n\n' +
            '*Till den aktuella kanalen:*\n' +
            '• `/delay 5m say glöm inte standup`\n' +
            '• `/delay 8am tomorrow say god morgon! uppdatera kalkylbladet`\n\n' +
            '*Till andra kanaler:* lägg till en eller flera #kanaler före `say` (valfri ordning):\n' +
            '• `/delay 10m #announcements say underhållsfönstret börjar snart`\n\n' +
            '*Som direktmeddelande:* lägg till en eller flera @omnämnanden före `say` (valfri ordning):\n' +
            '• `/delay @bob 5m say hör av dig när du är ledig`\n\n' +
            '*Upprepa ett meddelande:* börja med `every` och ange dag och tid:\n' +
            '• `/delay every day at 8am say standup börjar snart`\n' +
            '• `/delay every weekday at 9am #team say morgoncheck`\n' +
            '• `/delay every monday at 8am say kolla veckans uppgifter`\n' +
            'Upprepningar pågår till du avbryter dem, `/delay list` visar nästa gång.\n\n' +
            '*Tidsformat:* fördröjningar `5m` `8h` `2d` `1w` och kombinationer `8h30m`; klockslag `8am`, `14:30`, `noon`, `midnight` med `today`, `tomorrow`, en veckodag eller `next <veckodag>`.\n' +
            'Klockslag använder *din* tidszon (profilinställning).\n\n' +
            '*Hantera:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    pt: {
        confirm_scheduled: '✅ Agendado: será enviado {target} às *{when}* ({relative}). ID da mensagem: `{id}`',
        confirm_target_room: 'para este canal',
        confirm_target_dm: 'como mensagem direta a {users}',
        confirm_target_channels: 'para {channels}',
        confirm_target_reminder: 'como lembrete para ti',
        confirm_scheduled_recurring: '✅ Agendado *{recurrence}*: será enviado {target}, a próxima vez em *{next}*. ID da mensagem: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · próxima vez {next} · {target}',
        recur_daily: 'todos os dias às {time}',
        recur_weekdays: 'em cada dia de semana às {time}',
        recur_weekly: 'todas as {weekday} às {time}',
        err_recur_unsupported: 'As repetições precisam de um dia e uma hora, ex. `every day at 8am`, `every weekday at 9am` ou `every monday at 8am`.',
        err_recur_limit: 'Já tens {max} agendamentos recorrentes, o limite definido pelo administrador. Cancela um primeiro.',
        err_recur_disabled: 'As mensagens recorrentes estão desativadas neste espaço de trabalho.',
        recur_cancelled_access: '🔁 A tua mensagem recorrente `{id}` foi cancelada porque já não tens acesso a {target}.',
        remind_delivery: '⏰ Lembrete: {text}',
        remind_help_text:
            '*Lembretes pessoais (`/remind`)*\n' +
            'A app lembra-te por mensagem direta à hora escolhida. A palavra `say` é obrigatória.\n\n' +
            '• `/remind 20m say verifica o forno`\n' +
            '• `/remind 8am tomorrow say entrega o relatório`\n\n' +
            '*Repetir um lembrete:* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Gerir:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'O canal #{name} não foi encontrado neste servidor.',
        err_not_channel_member: 'Não és membro de #{name}.',
        tz_warning: '⚠️ O teu perfil não tem fuso horário definido, por isso foi usada a hora do *servidor*.',
        err_no_message: 'Nada para enviar. Escreve a mensagem depois da palavra `say`, ex. `/{cmd} 5m say olá`.',
        err_say_no_text: 'Nenhum texto depois de `say`. Mantém o comando inteiro numa só linha: o Rocket.Chat descarta o texto dos comandos de barra após uma quebra de linha.',
        err_no_time: 'Nenhuma indicação de tempo encontrada. Usa um atraso como `5m`, `8h30m` ou uma hora como `8am tomorrow`.',
        err_seconds_unsupported: 'Os segundos não são suportados. O atraso mínimo é um minuto, ex. `1m` ou `8h30m`.',
        err_unknown_token: 'Não foi possível entender `{token}`. Escreve `/{cmd} help` para ver os formatos aceites.',
        err_mixed_time: 'Não é possível combinar um atraso relativo (`5m`) com uma hora (`8am tomorrow`). Usa apenas um.',
        err_need_time_of_day: 'Indica uma hora do dia, ex. `8am tomorrow` ou `next monday 14:30`.',
        err_past: 'Essa hora já passou. Escolhe uma hora futura.',
        err_too_far: 'Isso está a mais de {days} dias (o limite do administrador para esta app).',
        err_user_not_found: 'O utilizador `@{username}` não foi encontrado neste servidor.',
        err_schedule_failed: 'O agendamento falhou. Verifica os logs da app.',
        list_header: '📋 As tuas mensagens agendadas:',
        btn_cancel: 'Cancelar',
        btn_list: 'Lista',
        btn_help: 'Ajuda',
        btn_show: 'Mostrar',
        welcome_install: '👋 Obrigado por instalares o Message Scheduler! Funciona assim:',
        list_empty: 'Não tens mensagens agendadas.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'para {name}',
        list_target_dm_room: 'para a mensagem direta com {users}',
        list_target_gone: 'para uma sala que já não existe',
        cancel_usage: 'Utilização: `/{cmd} cancel <id>` ou `/{cmd} cancel all` (os ids aparecem em `/{cmd} list`).',
        cancel_not_found: 'Nenhuma mensagem agendada com o id `{id}` (talvez já tenha sido enviada).',
        cancel_done: '🗑️ Mensagem agendada `{id}` cancelada.',
        cancel_all_done: '🗑️ {count} mensagem(ns) agendada(s) cancelada(s).',
        relative_in: 'daqui a {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Agenda uma mensagem para ser enviada mais tarde, em teu nome.\n' +
            'A palavra `say` é obrigatória. Tudo antes define a hora e os destinos, tudo depois é enviado como mensagem.\n\n' +
            '*Para o canal atual:*\n' +
            '• `/delay 5m say não te esqueças do standup`\n' +
            '• `/delay 8am tomorrow say bom dia! atualiza a folha de cálculo`\n\n' +
            '*Para outros canais:* adiciona um ou mais #canais antes de `say` (em qualquer ordem):\n' +
            '• `/delay 10m #announcements say a manutenção começa em breve`\n\n' +
            '*Como mensagem direta:* adiciona uma ou mais @menções antes de `say` (em qualquer ordem):\n' +
            '• `/delay @bob 5m say avisa-me quando estiveres livre`\n\n' +
            '*Repetir uma mensagem:* começa com `every` e indica dia e hora:\n' +
            '• `/delay every day at 8am say o standup começa em breve`\n' +
            '• `/delay every weekday at 9am #team say ponto da manhã`\n' +
            '• `/delay every monday at 8am say verifica as tarefas da semana`\n' +
            'As repetições continuam até as cancelares, `/delay list` mostra a próxima.\n\n' +
            '*Formatos:* atrasos `5m` `8h` `2d` `1w` e combinações `8h30m`; horas `8am`, `14:30`, `noon`, `midnight` com `today`, `tomorrow`, um dia da semana ou `next <dia>`.\n' +
            'As horas usam o *teu* fuso horário (definição do perfil).\n\n' +
            '*Gerir:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    'pt-br': {
        confirm_scheduled: '✅ Agendado: será enviado {target} às *{when}* ({relative}). ID da mensagem: `{id}`',
        confirm_target_room: 'para este canal',
        confirm_target_dm: 'como mensagem direta para {users}',
        confirm_target_channels: 'para {channels}',
        confirm_target_reminder: 'como lembrete para você',
        confirm_scheduled_recurring: '✅ Agendado *{recurrence}*: será enviado {target}, a próxima vez em *{next}*. ID da mensagem: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · próxima vez {next} · {target}',
        recur_daily: 'todos os dias às {time}',
        recur_weekdays: 'em todo dia útil às {time}',
        recur_weekly: 'toda {weekday} às {time}',
        err_recur_unsupported: 'As repetições precisam de um dia e um horário, ex. `every day at 8am`, `every weekday at 9am` ou `every monday at 8am`.',
        err_recur_limit: 'Você já tem {max} agendamentos recorrentes, o limite definido pelo administrador. Cancele um primeiro.',
        err_recur_disabled: 'As mensagens recorrentes estão desativadas neste espaço de trabalho.',
        recur_cancelled_access: '🔁 Sua mensagem recorrente `{id}` foi cancelada porque você não tem mais acesso a {target}.',
        remind_delivery: '⏰ Lembrete: {text}',
        remind_help_text:
            '*Lembretes pessoais (`/remind`)*\n' +
            'O app lembra você por mensagem direta no horário escolhido. A palavra `say` é obrigatória.\n\n' +
            '• `/remind 20m say verifique o forno`\n' +
            '• `/remind 8am tomorrow say entregue o relatório`\n\n' +
            '*Repetir um lembrete:* `/remind every weekday at 9am say stand-up`\n\n' +
            '*Gerenciar:* `/remind list`, `/remind cancel <id>`, `/remind cancel all`',
        err_channel_not_found: 'O canal #{name} não foi encontrado neste servidor.',
        err_not_channel_member: 'Você não é membro de #{name}.',
        tz_warning: '⚠️ Seu perfil não tem fuso horário definido, então o horário do *servidor* foi usado.',
        err_no_message: 'Nada para enviar. Coloque a mensagem depois da palavra `say`, ex. `/{cmd} 5m say olá`.',
        err_say_no_text: 'Nenhum texto depois de `say`. Mantenha o comando inteiro em uma única linha: o Rocket.Chat descarta o texto de comandos de barra após uma quebra de linha.',
        err_no_time: 'Nenhuma indicação de tempo encontrada. Use um atraso como `5m`, `8h30m` ou um horário como `8am tomorrow`.',
        err_seconds_unsupported: 'Os segundos não são suportados. O atraso mínimo é um minuto, ex. `1m` ou `8h30m`.',
        err_unknown_token: 'Não foi possível entender `{token}`. Digite `/{cmd} help` para ver os formatos aceitos.',
        err_mixed_time: 'Não é possível combinar um atraso relativo (`5m`) com um horário (`8am tomorrow`). Use apenas um.',
        err_need_time_of_day: 'Informe um horário, ex. `8am tomorrow` ou `next monday 14:30`.',
        err_past: 'Esse horário já passou. Escolha um horário futuro.',
        err_too_far: 'Isso está a mais de {days} dias (o limite do administrador para este app).',
        err_user_not_found: 'O usuário `@{username}` não foi encontrado neste servidor.',
        err_schedule_failed: 'O agendamento falhou. Verifique os logs do app.',
        list_header: '📋 Suas mensagens agendadas:',
        btn_cancel: 'Cancelar',
        btn_list: 'Lista',
        btn_help: 'Ajuda',
        btn_show: 'Mostrar',
        welcome_install: '👋 Obrigado por instalar o Message Scheduler! Funciona assim:',
        list_empty: 'Você não tem mensagens agendadas.',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: 'para {name}',
        list_target_dm_room: 'para a mensagem direta com {users}',
        list_target_gone: 'para uma sala que não existe mais',
        cancel_usage: 'Uso: `/{cmd} cancel <id>` ou `/{cmd} cancel all` (os ids aparecem em `/{cmd} list`).',
        cancel_not_found: 'Nenhuma mensagem agendada com o id `{id}` (talvez já tenha sido enviada).',
        cancel_done: '🗑️ Mensagem agendada `{id}` cancelada.',
        cancel_all_done: '🗑️ {count} mensagem(ns) agendada(s) cancelada(s).',
        relative_in: 'em {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Agende uma mensagem para ser enviada mais tarde, em seu nome.\n' +
            'A palavra `say` é obrigatória. Tudo antes define o horário e os destinos, tudo depois é enviado como mensagem.\n\n' +
            '*Para o canal atual:*\n' +
            '• `/delay 5m say não esqueça o standup`\n' +
            '• `/delay 8am tomorrow say bom dia! atualize a planilha`\n\n' +
            '*Para outros canais:* adicione um ou mais #canais antes de `say` (em qualquer ordem):\n' +
            '• `/delay 10m #announcements say a manutenção começa em breve`\n\n' +
            '*Como mensagem direta:* adicione uma ou mais @menções antes de `say` (em qualquer ordem):\n' +
            '• `/delay @bob 5m say me avise quando estiver livre`\n\n' +
            '*Repetir uma mensagem:* comece com `every` e informe dia e horário:\n' +
            '• `/delay every day at 8am say o standup começa em breve`\n' +
            '• `/delay every weekday at 9am #team say check-in da manhã`\n' +
            '• `/delay every monday at 8am say verifique as tarefas da semana`\n' +
            'As repetições continuam até você cancelar, `/delay list` mostra a próxima.\n\n' +
            '*Formatos:* atrasos `5m` `8h` `2d` `1w` e combinações `8h30m`; horários `8am`, `14:30`, `noon`, `midnight` com `today`, `tomorrow`, um dia da semana ou `next <dia>`.\n' +
            'Os horários usam o *seu* fuso horário (configuração do perfil).\n\n' +
            '*Gerenciar:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    ja: {
        confirm_scheduled: '✅ 予約しました: *{when}* に{target}送信します（{relative}）。メッセージ ID: `{id}`',
        confirm_target_room: 'このチャンネルに',
        confirm_target_dm: '{users} へのダイレクトメッセージとして',
        confirm_target_channels: '{channels} に',
        confirm_target_reminder: 'あなたへのリマインダーとして',
        confirm_scheduled_recurring: '✅ *{recurrence}* で予約しました: {target}送信します。次回は *{next}*。メッセージ ID: `{id}`',
        list_line_head_recurring: 'ID `{id}` · 🔁 *{recurrence}* · 次回 {next} · {target}',
        recur_daily: '毎日 {time}',
        recur_weekdays: '平日の {time}',
        recur_weekly: '毎週{weekday} {time}',
        err_recur_unsupported: '繰り返しには曜日と時刻が必要です。例: `every day at 8am`、`every weekday at 9am`、`every monday at 8am`',
        err_recur_limit: '繰り返しスケジュールは既に {max} 件あり、管理者の上限に達しています。先にどれかをキャンセルしてください。',
        err_recur_disabled: 'このワークスペースでは繰り返しメッセージが無効になっています。',
        recur_cancelled_access: '🔁 {target} へのアクセス権がなくなったため、繰り返しメッセージ `{id}` をキャンセルしました。',
        remind_delivery: '⏰ リマインダー: {text}',
        remind_help_text:
            '*個人リマインダー (`/remind`)*\n' +
            '指定した時刻にアプリがダイレクトメッセージでお知らせします。`say` は必須です。\n\n' +
            '• `/remind 20m say オーブンを確認`\n' +
            '• `/remind 8am tomorrow say レポートを提出`\n\n' +
            '*リマインダーを繰り返す:* `/remind every weekday at 9am say スタンドアップ`\n\n' +
            '*管理:* `/remind list`、`/remind cancel <id>`、`/remind cancel all`',
        err_channel_not_found: 'チャンネル #{name} はこのサーバーに見つかりません。',
        err_not_channel_member: '#{name} のメンバーではありません。',
        tz_warning: '⚠️ プロフィールにタイムゾーンが設定されていないため、*サーバー*の時刻を使用しました。',
        err_no_message: '送信する内容がありません。`say` の後にメッセージを書いてください。例: `/{cmd} 5m say こんにちは`',
        err_say_no_text: '`say` の後にテキストがありません。コマンド全体を 1 行で入力してください。Rocket.Chat はスラッシュコマンドの改行以降のテキストを破棄します。',
        err_no_time: '時間の指定が見つかりません。`5m` や `8h30m` のような遅延、または `8am tomorrow` のような時刻を使ってください。',
        err_seconds_unsupported: '秒は使用できません。最小の遅延は 1 分です。例: `1m`、`8h30m`',
        err_unknown_token: '`{token}` を解釈できませんでした。`/{cmd} help` で使用できる形式を確認してください。',
        err_mixed_time: '相対的な遅延（`5m`）と時刻指定（`8am tomorrow`）は同時に使えません。どちらか一方を使ってください。',
        err_need_time_of_day: '時刻を指定してください。例: `8am tomorrow`、`next monday 14:30`',
        err_past: 'その時刻は過去です。未来の時刻を指定してください。',
        err_too_far: '{days} 日より先は指定できません（管理者による制限）。',
        err_user_not_found: 'ユーザー `@{username}` はこのサーバーに見つかりません。',
        err_schedule_failed: '予約に失敗しました。アプリのログを確認してください。',
        list_header: '📋 予約中のメッセージ:',
        btn_cancel: 'キャンセル',
        btn_list: '一覧',
        btn_help: 'ヘルプ',
        btn_show: '表示',
        welcome_install: '👋 Message Scheduler をインストールいただきありがとうございます！使い方:',
        list_empty: '予約中のメッセージはありません。',
        list_line_head: 'ID `{id}` · *{when}* · {target}',
        list_target_channel: '{name} に',
        list_target_dm_room: '{users} とのダイレクトメッセージに',
        list_target_gone: '存在しないルームに',
        cancel_usage: '使い方: `/{cmd} cancel <id>` または `/{cmd} cancel all`（id は `/{cmd} list` で確認できます）',
        cancel_not_found: 'id `{id}` の予約メッセージが見つかりません（すでに送信された可能性があります）。',
        cancel_done: '🗑️ 予約メッセージ `{id}` をキャンセルしました。',
        cancel_all_done: '🗑️ {count} 件の予約メッセージをキャンセルしました。',
        relative_in: '{duration} 後',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'メッセージを予約して、あとで自分の名前で送信します。\n' +
            '`say` は必須です。`say` の前が時間と宛先、後がメッセージとして送信されます。\n\n' +
            '*現在のチャンネルに送信:*\n' +
            '• `/delay 5m say スタンドアップを忘れずに`\n' +
            '• `/delay 8am tomorrow say おはようございます！スプレッドシートを更新してください`\n\n' +
            '*他のチャンネルに送信:* `say` の前に #チャンネルを追加します（順序は自由）:\n' +
            '• `/delay 10m #announcements say まもなくメンテナンスが始まります`\n\n' +
            '*ダイレクトメッセージとして送信:* `say` の前に @メンションを追加します（順序は自由）:\n' +
            '• `/delay @bob 5m say 手が空いたら連絡ください`\n\n' +
            '*メッセージを繰り返す:* `every` で始めて曜日と時刻を指定します:\n' +
            '• `/delay every day at 8am say もうすぐスタンドアップです`\n' +
            '• `/delay every weekday at 9am #team say 朝のチェックイン`\n' +
            '• `/delay every monday at 8am say 今週のタスクを確認`\n' +
            '繰り返しはキャンセルするまで続きます。次回は `/delay list` で確認できます。\n\n' +
            '*時間の形式:* 遅延 `5m` `8h` `2d` `1w`、組み合わせ `8h30m`。時刻 `8am`、`14:30`、`noon`、`midnight` を `today`、`tomorrow`、曜日、`next <曜日>` と組み合わせられます。\n' +
            '時刻は*あなたの*タイムゾーン（プロフィール設定）で解釈されます。\n\n' +
            '*管理:* `/delay list`、`/delay cancel <id>`、`/delay cancel all`',
    },
};

const weekdayNames: Record<string, Array<string>> = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    it: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
    es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    sv: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
    pt: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
    'pt-br': ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
    ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
};

const monthNames: Record<string, Array<string>> = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    fr: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
    it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
    es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    sv: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    'pt-br': ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

export function getUserLanguage(user?: IUser): string {
    const lang = user && user.settings && user.settings.preferences
        ? (user.settings.preferences as { language?: string }).language
        : undefined;
    const norm = (lang || 'en').toLowerCase();
    // exact regional match first ("pt-BR" -> "pt-br"), then base ("de-AT" -> "de")
    if (strings[norm]) {
        return norm;
    }
    const base = norm.split('-')[0];
    return strings[base] ? base : 'en';
}

export function t(lang: string, key: string, params?: Record<string, string | number>): string {
    const catalog = strings[lang] || strings.en;
    let text = catalog[key] || strings.en[key] || key;
    if (params) {
        for (const name of Object.keys(params)) {
            text = text.split(`{${name}}`).join(String(params[name]));
        }
    }
    return text;
}

export function weekdayName(lang: string, day: number): string {
    return (weekdayNames[lang] || weekdayNames.en)[day];
}

export function monthName(lang: string, month: number): string {
    return (monthNames[lang] || monthNames.en)[month];
}
