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
        confirm_scheduled: '✅ Scheduled `{id}`: will send {target} at *{when}* ({relative}).',
        confirm_target_room: 'to this channel',
        confirm_target_dm: 'a direct message to {users}',
        tz_warning: '⚠️ Your profile has no timezone set, so *server time* was used to resolve the time.',
        err_no_message: 'Nothing to send. Put the message after the word `say`, e.g. `/delay 5m say hello`.',
        err_say_no_text: 'Nothing to send after `say`. Keep the whole command on one line: Rocket.Chat discards slash command text after a line break.',
        err_no_time: 'No time found. Use a delay like `5m`, `8h30m`, or a time like `8am tomorrow`, `10am next monday`.',
        err_unknown_token: 'Could not understand `{token}`. Type `/delay help` for the accepted formats.',
        err_mixed_time: 'Mixing a relative delay (like `5m`) with a clock time (like `8am tomorrow`) is not supported. Use one or the other.',
        err_need_time_of_day: 'Please include a time of day, e.g. `8am tomorrow` or `next monday 14:30`.',
        err_past: 'That time is in the past. Pick a future time.',
        err_too_far: 'That is more than {days} days away (the admin limit for this app).',
        err_user_not_found: 'User `@{username}` was not found on this server.',
        err_schedule_failed: 'Scheduling failed. Check the app logs.',
        list_header: '📋 Your scheduled messages:',
        list_empty: 'You have no scheduled messages.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Usage: `/delay cancel <id>` or `/delay cancel all` (get ids from `/delay list`).',
        cancel_not_found: 'No scheduled message with id `{id}` found (it may have already been sent).',
        cancel_done: '🗑️ Scheduled message `{id}` cancelled.',
        cancel_all_done: '🗑️ Cancelled {count} scheduled message(s).',
        relative_in: 'in {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Schedule a message to be sent later, as you.\n\n' +
            '*Send to the current channel:*\n' +
            '• `/delay 5m say don\'t forget the standup`\n' +
            '• `/delay 1h30m say build should be done now`\n' +
            '• `/delay 8am tomorrow say morning! update the spreadsheet`\n' +
            '• `/delay 10am next monday say sprint planning in 30 minutes`\n\n' +
            '*Send as a direct message:* add one or more @mentions (before `say`, any order):\n' +
            '• `/delay @bob 5m say ping me when free`\n' +
            '• `/delay 8h @bob @carol say nudge: review my PR`\n\n' +
            '*Time formats:* delays `3s` `5m` `8h` `2d` `1w` and combos `8h30m`; clock times `8am`, `14:30`, `noon`, `midnight` with `today`, `tomorrow`, a weekday, or `next <weekday>`.\n' +
            'Clock times use *your* timezone (profile setting).\n\n' +
            '*Manage:*\n' +
            '• `/delay list`: your pending messages\n' +
            '• `/delay cancel <id>`: cancel one (id shown at scheduling and in list)\n' +
            '• `/delay cancel all`: cancel all yours',
    },
    de: {
        confirm_scheduled: '✅ Geplant `{id}`: wird {target} um *{when}* gesendet ({relative}).',
        confirm_target_room: 'in diesen Kanal',
        confirm_target_dm: 'als Direktnachricht an {users}',
        tz_warning: '⚠️ In deinem Profil ist keine Zeitzone gesetzt, daher wurde die *Serverzeit* verwendet.',
        err_no_message: 'Keine Nachricht angegeben. Schreibe die Nachricht nach dem Wort `say`, z. B. `/delay 5m say hallo`.',
        err_say_no_text: 'Nach `say` folgt kein Text. Schreibe den gesamten Befehl in eine Zeile: Rocket.Chat verwirft bei Slash-Befehlen den Text nach einem Zeilenumbruch.',
        err_no_time: 'Keine Zeitangabe gefunden. Nutze eine Verzögerung wie `5m`, `8h30m` oder eine Uhrzeit wie `8am tomorrow`.',
        err_unknown_token: '`{token}` wurde nicht verstanden. Tippe `/delay help` für die gültigen Formate.',
        err_mixed_time: 'Eine relative Verzögerung (`5m`) und eine Uhrzeit (`8am tomorrow`) können nicht kombiniert werden.',
        err_need_time_of_day: 'Bitte eine Uhrzeit angeben, z. B. `8am tomorrow` oder `next monday 14:30`.',
        err_past: 'Dieser Zeitpunkt liegt in der Vergangenheit.',
        err_too_far: 'Das ist mehr als {days} Tage entfernt (das Admin-Limit dieser App).',
        err_user_not_found: 'Benutzer `@{username}` wurde nicht gefunden.',
        err_schedule_failed: 'Planung fehlgeschlagen. Bitte App-Logs prüfen.',
        list_header: '📋 Deine geplanten Nachrichten:',
        list_empty: 'Du hast keine geplanten Nachrichten.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Nutzung: `/delay cancel <id>` oder `/delay cancel all` (IDs via `/delay list`).',
        cancel_not_found: 'Keine geplante Nachricht mit ID `{id}` gefunden (evtl. bereits gesendet).',
        cancel_done: '🗑️ Geplante Nachricht `{id}` storniert.',
        cancel_all_done: '🗑️ {count} geplante Nachricht(en) storniert.',
        relative_in: 'in {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Plane eine Nachricht, die später in deinem Namen gesendet wird.\n\n' +
            '*In den aktuellen Kanal:*\n' +
            '• `/delay 5m say Standup nicht vergessen`\n' +
            '• `/delay 8am tomorrow say Guten Morgen! Tabelle aktualisieren`\n\n' +
            '*Als Direktnachricht:* @Erwähnungen vor `say` hinzufügen (Reihenfolge egal):\n' +
            '• `/delay @bob 5m say melde dich, wenn du frei bist`\n\n' +
            '*Zeitformate:* Verzögerungen `3s` `5m` `8h` `2d` `1w`, Kombis `8h30m`; Uhrzeiten `8am`, `14:30`, `noon`, `midnight` mit `today`, `tomorrow`, Wochentag oder `next <Wochentag>`.\n' +
            'Uhrzeiten nutzen *deine* Zeitzone (Profileinstellung).\n\n' +
            '*Verwalten:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    fr: {
        confirm_scheduled: '✅ Planifié `{id}` : sera envoyé {target} à *{when}* ({relative}).',
        confirm_target_room: 'dans ce canal',
        confirm_target_dm: 'en message direct à {users}',
        tz_warning: '⚠️ Aucun fuseau horaire dans votre profil : l\'heure du *serveur* a été utilisée.',
        err_no_message: 'Aucun message à envoyer. Placez le message après le mot `say`, ex. `/delay 5m say bonjour`.',
        err_say_no_text: 'Aucun texte après `say`. Gardez toute la commande sur une seule ligne : Rocket.Chat ignore le texte des commandes slash après un saut de ligne.',
        err_no_time: 'Aucune indication de temps. Utilisez un délai comme `5m`, `8h30m` ou une heure comme `8am tomorrow`.',
        err_unknown_token: '`{token}` non compris. Tapez `/delay help` pour les formats acceptés.',
        err_mixed_time: 'Impossible de combiner un délai relatif (`5m`) et une heure (`8am tomorrow`).',
        err_need_time_of_day: 'Veuillez préciser une heure, ex. `8am tomorrow` ou `next monday 14:30`.',
        err_past: 'Cette heure est déjà passée.',
        err_too_far: 'C\'est à plus de {days} jours (limite fixée par l\'administrateur).',
        err_user_not_found: 'Utilisateur `@{username}` introuvable.',
        err_schedule_failed: 'Échec de la planification. Consultez les logs de l\'app.',
        list_header: '📋 Vos messages planifiés :',
        list_empty: 'Vous n\'avez aucun message planifié.',
        list_line: '• `{id}` · *{when}* · {target} : "{snippet}"',
        cancel_usage: 'Usage : `/delay cancel <id>` ou `/delay cancel all` (ids via `/delay list`).',
        cancel_not_found: 'Aucun message planifié avec l\'id `{id}` (peut-être déjà envoyé).',
        cancel_done: '🗑️ Message planifié `{id}` annulé.',
        cancel_all_done: '🗑️ {count} message(s) planifié(s) annulé(s).',
        relative_in: 'dans {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Planifiez un message envoyé plus tard, en votre nom.\n\n' +
            '*Dans le canal courant :*\n' +
            '• `/delay 5m say n\'oubliez pas le standup`\n' +
            '• `/delay 8am tomorrow say pensez à mettre à jour le tableur`\n\n' +
            '*En message direct :* ajoutez des @mentions avant `say` (ordre libre) :\n' +
            '• `/delay @bob 5m say ping quand tu es libre`\n\n' +
            '*Formats :* délais `3s` `5m` `8h` `2d` `1w`, combinés `8h30m` ; heures `8am`, `14:30`, `noon`, `midnight` avec `today`, `tomorrow`, un jour de semaine ou `next <jour>`.\n' +
            'Les heures utilisent *votre* fuseau (profil).\n\n' +
            '*Gérer :* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    it: {
        confirm_scheduled: '✅ Pianificato `{id}`: sarà inviato {target} alle *{when}* ({relative}).',
        confirm_target_room: 'in questo canale',
        confirm_target_dm: 'come messaggio diretto a {users}',
        tz_warning: '⚠️ Il tuo profilo non ha un fuso orario impostato, quindi è stato usato l\'orario del *server*.',
        err_no_message: 'Nessun messaggio da inviare. Scrivi il messaggio dopo la parola `say`, es. `/delay 5m say ciao`.',
        err_say_no_text: 'Nessun testo dopo `say`. Tieni l\'intero comando su una sola riga: Rocket.Chat scarta il testo dei comandi slash dopo un ritorno a capo.',
        err_no_time: 'Nessuna indicazione di tempo. Usa un ritardo come `5m`, `8h30m` o un orario come `8am tomorrow`.',
        err_unknown_token: '`{token}` non riconosciuto. Digita `/delay help` per i formati accettati.',
        err_mixed_time: 'Non è possibile combinare un ritardo relativo (`5m`) con un orario (`8am tomorrow`). Usane uno solo.',
        err_need_time_of_day: 'Indica un orario, es. `8am tomorrow` o `next monday 14:30`.',
        err_past: 'Quell\'orario è già passato. Scegli un orario futuro.',
        err_too_far: 'Sono più di {days} giorni (il limite impostato dall\'amministratore).',
        err_user_not_found: 'Utente `@{username}` non trovato su questo server.',
        err_schedule_failed: 'Pianificazione non riuscita. Controlla i log dell\'app.',
        list_header: '📋 I tuoi messaggi pianificati:',
        list_empty: 'Non hai messaggi pianificati.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Uso: `/delay cancel <id>` oppure `/delay cancel all` (gli id sono in `/delay list`).',
        cancel_not_found: 'Nessun messaggio pianificato con id `{id}` (forse è già stato inviato).',
        cancel_done: '🗑️ Messaggio pianificato `{id}` annullato.',
        cancel_all_done: '🗑️ Annullati {count} messaggi pianificati.',
        relative_in: 'tra {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Pianifica un messaggio da inviare più tardi, a tuo nome.\n\n' +
            '*Nel canale corrente:*\n' +
            '• `/delay 5m say non dimenticare lo standup`\n' +
            '• `/delay 8am tomorrow say buongiorno! aggiorna il foglio di calcolo`\n\n' +
            '*Come messaggio diretto:* aggiungi una o più @menzioni prima di `say` (in qualsiasi ordine):\n' +
            '• `/delay @bob 5m say scrivimi quando sei libero`\n\n' +
            '*Formati:* ritardi `3s` `5m` `8h` `2d` `1w`, combinati `8h30m`; orari `8am`, `14:30`, `noon`, `midnight` con `today`, `tomorrow`, un giorno della settimana o `next <giorno>`.\n' +
            'Gli orari usano il *tuo* fuso orario (impostazione del profilo).\n\n' +
            '*Gestione:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    es: {
        confirm_scheduled: '✅ Programado `{id}`: se enviará {target} a las *{when}* ({relative}).',
        confirm_target_room: 'a este canal',
        confirm_target_dm: 'como mensaje directo a {users}',
        tz_warning: '⚠️ Tu perfil no tiene zona horaria configurada, así que se usó la hora del *servidor*.',
        err_no_message: 'No hay nada que enviar. Escribe el mensaje después de la palabra `say`, p. ej. `/delay 5m say hola`.',
        err_say_no_text: 'No hay texto después de `say`. Mantén todo el comando en una sola línea: Rocket.Chat descarta el texto de los comandos de barra después de un salto de línea.',
        err_no_time: 'No se encontró ninguna indicación de tiempo. Usa un retraso como `5m`, `8h30m` o una hora como `8am tomorrow`.',
        err_unknown_token: 'No se entendió `{token}`. Escribe `/delay help` para ver los formatos aceptados.',
        err_mixed_time: 'No se puede combinar un retraso relativo (`5m`) con una hora (`8am tomorrow`). Usa solo uno.',
        err_need_time_of_day: 'Incluye una hora del día, p. ej. `8am tomorrow` o `next monday 14:30`.',
        err_past: 'Esa hora ya pasó. Elige una hora futura.',
        err_too_far: 'Eso está a más de {days} días (el límite del administrador).',
        err_user_not_found: 'No se encontró al usuario `@{username}` en este servidor.',
        err_schedule_failed: 'La programación falló. Revisa los logs de la app.',
        list_header: '📋 Tus mensajes programados:',
        list_empty: 'No tienes mensajes programados.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Uso: `/delay cancel <id>` o `/delay cancel all` (los ids aparecen en `/delay list`).',
        cancel_not_found: 'No hay ningún mensaje programado con id `{id}` (quizá ya fue enviado).',
        cancel_done: '🗑️ Mensaje programado `{id}` cancelado.',
        cancel_all_done: '🗑️ {count} mensaje(s) programado(s) cancelado(s).',
        relative_in: 'en {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Programa un mensaje para enviarlo más tarde, en tu nombre.\n\n' +
            '*Al canal actual:*\n' +
            '• `/delay 5m say no olvides el standup`\n' +
            '• `/delay 8am tomorrow say ¡buenos días! actualiza la hoja de cálculo`\n\n' +
            '*Como mensaje directo:* añade una o más @menciones antes de `say` (en cualquier orden):\n' +
            '• `/delay @bob 5m say avísame cuando estés libre`\n\n' +
            '*Formatos:* retrasos `3s` `5m` `8h` `2d` `1w` y combinados `8h30m`; horas `8am`, `14:30`, `noon`, `midnight` con `today`, `tomorrow`, un día de la semana o `next <día>`.\n' +
            'Las horas usan *tu* zona horaria (ajuste del perfil).\n\n' +
            '*Gestión:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    sv: {
        confirm_scheduled: '✅ Schemalagt `{id}`: skickas {target} kl. *{when}* ({relative}).',
        confirm_target_room: 'till den här kanalen',
        confirm_target_dm: 'som direktmeddelande till {users}',
        tz_warning: '⚠️ Din profil saknar tidszon, så *serverns* tid användes.',
        err_no_message: 'Inget att skicka. Skriv meddelandet efter ordet `say`, t.ex. `/delay 5m say hej`.',
        err_say_no_text: 'Ingen text efter `say`. Håll hela kommandot på en rad: Rocket.Chat kastar bort text efter en radbrytning i snedstreckskommandon.',
        err_no_time: 'Ingen tidsangivelse hittades. Använd en fördröjning som `5m`, `8h30m` eller en tid som `8am tomorrow`.',
        err_unknown_token: 'Förstod inte `{token}`. Skriv `/delay help` för giltiga format.',
        err_mixed_time: 'Det går inte att blanda en relativ fördröjning (`5m`) med en klocktid (`8am tomorrow`). Välj en av dem.',
        err_need_time_of_day: 'Ange en tid på dygnet, t.ex. `8am tomorrow` eller `next monday 14:30`.',
        err_past: 'Den tiden har redan passerat. Välj en framtida tid.',
        err_too_far: 'Det är mer än {days} dagar bort (administratörens gräns för appen).',
        err_user_not_found: 'Användaren `@{username}` hittades inte på den här servern.',
        err_schedule_failed: 'Schemaläggningen misslyckades. Kontrollera appens loggar.',
        list_header: '📋 Dina schemalagda meddelanden:',
        list_empty: 'Du har inga schemalagda meddelanden.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Användning: `/delay cancel <id>` eller `/delay cancel all` (id:n visas i `/delay list`).',
        cancel_not_found: 'Inget schemalagt meddelande med id `{id}` hittades (det kan redan ha skickats).',
        cancel_done: '🗑️ Schemalagt meddelande `{id}` avbrutet.',
        cancel_all_done: '🗑️ {count} schemalagda meddelande(n) avbrutna.',
        relative_in: 'om {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Schemalägg ett meddelande som skickas senare, i ditt namn.\n\n' +
            '*Till den aktuella kanalen:*\n' +
            '• `/delay 5m say glöm inte standup`\n' +
            '• `/delay 8am tomorrow say god morgon! uppdatera kalkylbladet`\n\n' +
            '*Som direktmeddelande:* lägg till en eller flera @omnämnanden före `say` (valfri ordning):\n' +
            '• `/delay @bob 5m say hör av dig när du är ledig`\n\n' +
            '*Tidsformat:* fördröjningar `3s` `5m` `8h` `2d` `1w` och kombinationer `8h30m`; klockslag `8am`, `14:30`, `noon`, `midnight` med `today`, `tomorrow`, en veckodag eller `next <veckodag>`.\n' +
            'Klockslag använder *din* tidszon (profilinställning).\n\n' +
            '*Hantera:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    pt: {
        confirm_scheduled: '✅ Agendado `{id}`: será enviado {target} às *{when}* ({relative}).',
        confirm_target_room: 'para este canal',
        confirm_target_dm: 'como mensagem direta a {users}',
        tz_warning: '⚠️ O teu perfil não tem fuso horário definido, por isso foi usada a hora do *servidor*.',
        err_no_message: 'Nada para enviar. Escreve a mensagem depois da palavra `say`, ex. `/delay 5m say olá`.',
        err_say_no_text: 'Nenhum texto depois de `say`. Mantém o comando inteiro numa só linha: o Rocket.Chat descarta o texto dos comandos de barra após uma quebra de linha.',
        err_no_time: 'Nenhuma indicação de tempo encontrada. Usa um atraso como `5m`, `8h30m` ou uma hora como `8am tomorrow`.',
        err_unknown_token: 'Não foi possível entender `{token}`. Escreve `/delay help` para ver os formatos aceites.',
        err_mixed_time: 'Não é possível combinar um atraso relativo (`5m`) com uma hora (`8am tomorrow`). Usa apenas um.',
        err_need_time_of_day: 'Indica uma hora do dia, ex. `8am tomorrow` ou `next monday 14:30`.',
        err_past: 'Essa hora já passou. Escolhe uma hora futura.',
        err_too_far: 'Isso está a mais de {days} dias (o limite do administrador para esta app).',
        err_user_not_found: 'O utilizador `@{username}` não foi encontrado neste servidor.',
        err_schedule_failed: 'O agendamento falhou. Verifica os logs da app.',
        list_header: '📋 As tuas mensagens agendadas:',
        list_empty: 'Não tens mensagens agendadas.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Utilização: `/delay cancel <id>` ou `/delay cancel all` (os ids aparecem em `/delay list`).',
        cancel_not_found: 'Nenhuma mensagem agendada com o id `{id}` (talvez já tenha sido enviada).',
        cancel_done: '🗑️ Mensagem agendada `{id}` cancelada.',
        cancel_all_done: '🗑️ {count} mensagem(ns) agendada(s) cancelada(s).',
        relative_in: 'daqui a {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Agenda uma mensagem para ser enviada mais tarde, em teu nome.\n\n' +
            '*Para o canal atual:*\n' +
            '• `/delay 5m say não te esqueças do standup`\n' +
            '• `/delay 8am tomorrow say bom dia! atualiza a folha de cálculo`\n\n' +
            '*Como mensagem direta:* adiciona uma ou mais @menções antes de `say` (em qualquer ordem):\n' +
            '• `/delay @bob 5m say avisa-me quando estiveres livre`\n\n' +
            '*Formatos:* atrasos `3s` `5m` `8h` `2d` `1w` e combinações `8h30m`; horas `8am`, `14:30`, `noon`, `midnight` com `today`, `tomorrow`, um dia da semana ou `next <dia>`.\n' +
            'As horas usam o *teu* fuso horário (definição do perfil).\n\n' +
            '*Gerir:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    'pt-br': {
        confirm_scheduled: '✅ Agendado `{id}`: será enviado {target} às *{when}* ({relative}).',
        confirm_target_room: 'para este canal',
        confirm_target_dm: 'como mensagem direta para {users}',
        tz_warning: '⚠️ Seu perfil não tem fuso horário definido, então o horário do *servidor* foi usado.',
        err_no_message: 'Nada para enviar. Coloque a mensagem depois da palavra `say`, ex. `/delay 5m say olá`.',
        err_say_no_text: 'Nenhum texto depois de `say`. Mantenha o comando inteiro em uma única linha: o Rocket.Chat descarta o texto de comandos de barra após uma quebra de linha.',
        err_no_time: 'Nenhuma indicação de tempo encontrada. Use um atraso como `5m`, `8h30m` ou um horário como `8am tomorrow`.',
        err_unknown_token: 'Não foi possível entender `{token}`. Digite `/delay help` para ver os formatos aceitos.',
        err_mixed_time: 'Não é possível combinar um atraso relativo (`5m`) com um horário (`8am tomorrow`). Use apenas um.',
        err_need_time_of_day: 'Informe um horário, ex. `8am tomorrow` ou `next monday 14:30`.',
        err_past: 'Esse horário já passou. Escolha um horário futuro.',
        err_too_far: 'Isso está a mais de {days} dias (o limite do administrador para este app).',
        err_user_not_found: 'O usuário `@{username}` não foi encontrado neste servidor.',
        err_schedule_failed: 'O agendamento falhou. Verifique os logs do app.',
        list_header: '📋 Suas mensagens agendadas:',
        list_empty: 'Você não tem mensagens agendadas.',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: 'Uso: `/delay cancel <id>` ou `/delay cancel all` (os ids aparecem em `/delay list`).',
        cancel_not_found: 'Nenhuma mensagem agendada com o id `{id}` (talvez já tenha sido enviada).',
        cancel_done: '🗑️ Mensagem agendada `{id}` cancelada.',
        cancel_all_done: '🗑️ {count} mensagem(ns) agendada(s) cancelada(s).',
        relative_in: 'em {duration}',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'Agende uma mensagem para ser enviada mais tarde, em seu nome.\n\n' +
            '*Para o canal atual:*\n' +
            '• `/delay 5m say não esqueça o standup`\n' +
            '• `/delay 8am tomorrow say bom dia! atualize a planilha`\n\n' +
            '*Como mensagem direta:* adicione uma ou mais @menções antes de `say` (em qualquer ordem):\n' +
            '• `/delay @bob 5m say me avise quando estiver livre`\n\n' +
            '*Formatos:* atrasos `3s` `5m` `8h` `2d` `1w` e combinações `8h30m`; horários `8am`, `14:30`, `noon`, `midnight` com `today`, `tomorrow`, um dia da semana ou `next <dia>`.\n' +
            'Os horários usam o *seu* fuso horário (configuração do perfil).\n\n' +
            '*Gerenciar:* `/delay list`, `/delay cancel <id>`, `/delay cancel all`',
    },
    ja: {
        confirm_scheduled: '✅ 予約 `{id}`: *{when}* に{target}送信します（{relative}）。',
        confirm_target_room: 'このチャンネルに',
        confirm_target_dm: '{users} へのダイレクトメッセージとして',
        tz_warning: '⚠️ プロフィールにタイムゾーンが設定されていないため、*サーバー*の時刻を使用しました。',
        err_no_message: '送信する内容がありません。`say` の後にメッセージを書いてください。例: `/delay 5m say こんにちは`',
        err_say_no_text: '`say` の後にテキストがありません。コマンド全体を 1 行で入力してください。Rocket.Chat はスラッシュコマンドの改行以降のテキストを破棄します。',
        err_no_time: '時間の指定が見つかりません。`5m` や `8h30m` のような遅延、または `8am tomorrow` のような時刻を使ってください。',
        err_unknown_token: '`{token}` を解釈できませんでした。`/delay help` で使用できる形式を確認してください。',
        err_mixed_time: '相対的な遅延（`5m`）と時刻指定（`8am tomorrow`）は同時に使えません。どちらか一方を使ってください。',
        err_need_time_of_day: '時刻を指定してください。例: `8am tomorrow`、`next monday 14:30`',
        err_past: 'その時刻は過去です。未来の時刻を指定してください。',
        err_too_far: '{days} 日より先は指定できません（管理者による制限）。',
        err_user_not_found: 'ユーザー `@{username}` はこのサーバーに見つかりません。',
        err_schedule_failed: '予約に失敗しました。アプリのログを確認してください。',
        list_header: '📋 予約中のメッセージ:',
        list_empty: '予約中のメッセージはありません。',
        list_line: '• `{id}` · *{when}* · {target}: "{snippet}"',
        cancel_usage: '使い方: `/delay cancel <id>` または `/delay cancel all`（id は `/delay list` で確認できます）',
        cancel_not_found: 'id `{id}` の予約メッセージが見つかりません（すでに送信された可能性があります）。',
        cancel_done: '🗑️ 予約メッセージ `{id}` をキャンセルしました。',
        cancel_all_done: '🗑️ {count} 件の予約メッセージをキャンセルしました。',
        relative_in: '{duration} 後',
        help_text:
            '*Message Scheduler (`/delay`)*\n' +
            'メッセージを予約して、あとで自分の名前で送信します。\n\n' +
            '*現在のチャンネルに送信:*\n' +
            '• `/delay 5m say スタンドアップを忘れずに`\n' +
            '• `/delay 8am tomorrow say おはようございます！スプレッドシートを更新してください`\n\n' +
            '*ダイレクトメッセージとして送信:* `say` の前に @メンションを追加します（順序は自由）:\n' +
            '• `/delay @bob 5m say 手が空いたら連絡ください`\n\n' +
            '*時間の形式:* 遅延 `3s` `5m` `8h` `2d` `1w`、組み合わせ `8h30m`。時刻 `8am`、`14:30`、`noon`、`midnight` を `today`、`tomorrow`、曜日、`next <曜日>` と組み合わせられます。\n' +
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
