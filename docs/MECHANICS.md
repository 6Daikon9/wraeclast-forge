# Правила крафта и границы модели

Проверено **8 ноября 2026 года** по русскому/английскому каталогу PoE2DB и игровым текстам предметов в HTML popup. Дата проверки не означает подтверждение определённого патча или доступности предмета в каждой лиге. Старые и отключённые механики могут оставаться в игровых данных.

Приложение — помощник для **ввода наблюдённого результата**, а не RNG-эмулятор. Игрок применяет валюту в игре и сообщает исход. Количество, сторона и семейства новых/снятых модов проверяются до записи. Запись результата и расходов должна происходить атомарно; отмена диалога не расходует валюту и не меняет вещь.

## Общие ограничения

- Обычная экипировка: явных модов нет. Магическая: максимум один префикс и один суффикс. Редкая: обычно до трёх префиксов и трёх суффиксов. У самоцветов и предметов с дополнительными разрешёнными модами другие лимиты; нельзя глобально применять 3+3 ко всем классам.
- Мод должен соответствовать базе, её атрибутному пулу, уровню предмета и конфликтам семейств. Тир и уровень модификатора — разные величины. T1 у одного семейства может требовать меньший ilvl, чем T2 другого.
- Осквернение, зеркальная копия, освящение, уничтожение и уникальная редкость — разные состояния. Не объединять их в один флаг: у каждого свои допустимые операции.
- Обычные валюты модификации запрещены на зеркальной копии, уничтоженном предмете и в обычном случае на осквернённой/освящённой вещи. Architect's Orb и Orb of Sacrifice специально работают с осквернёнными вещами; раскрытие уже наложенных скрытых модов тоже отдельная операция.
- Свойства `fractured`, `crafted`, `desecrated` и `unrevealed` относятся к конкретному моду. Раскол не должен автоматически очищать `crafted`: это разные признаки. При неполных сведениях об импортированном предмете требуется ручная проверка признаков.

Источники: [Crafting](https://poe2db.tw/us/Crafting), [Fractured Modifiers](https://poe2db.tw/us/Fractured_Modifiers), [Crafted Modifiers](https://poe2db.tw/us/Crafted_Modifiers), [Sanctified Items](https://poe2db.tw/us/Sanctified_Items).

## Обычные, Greater и Perfect сферы

| Семейство | До применения | Наблюдаемое изменение | Greater: минимальный уровень мода | Perfect: минимальный уровень мода |
|---|---|---|---:|---:|
| Transmutation | Normal | Magic; добавлен один случайный мод | 44 | 70 |
| Augmentation | Magic, есть свободное место | Добавлен один случайный мод | 44 | 70 |
| Regal | Magic | Rare; старые моды сохранены, добавлен один | 35 | 50 |
| Exalted | Rare, есть свободное место | Добавлен один случайный мод | 35 | 50 |
| Chaos | Rare, есть снимаемый мод | Снят один случайный мод, добавлен один | 35 | 50 |

Обычные версии не задают дополнительного нижнего порога. `Minimum Modifier Level` — не номер тира. Предмет с ilvl ниже порога нельзя обработать соответствующей валютой. **Исключение:** порог не должен полностью исключать конкретный тип модификатора; если все доступные на данном ilvl тиры типа ниже порога, сохраняется его старший доступный тир. Поэтому простой фильтр `mod.level >= floor` неверен.

Описание исключения: [Minimum Modifier Level](https://poe2db.tw/us/Minimum_Modifier_Level). Проверенные численные значения находятся непосредственно в popup: [Greater Transmutation](https://poe2db.tw/us/Greater_Orb_of_Transmutation), [Perfect Augmentation](https://poe2db.tw/us/Perfect_Orb_of_Augmentation), [Greater Regal](https://poe2db.tw/us/Greater_Regal_Orb), [Perfect Exalted](https://poe2db.tw/us/Perfect_Exalted_Orb), [Greater Chaos](https://poe2db.tw/us/Greater_Chaos_Orb).

## Снятие, закрепление и изменение значений

| Операция | Предусловие | Что записывает игрок | Проверки |
|---|---|---|---|
| Orb of Alchemy | Normal | Четыре новых обычных мода, Rare | Конфликты семейств и лимиты сторон; омен может дать максимум префиксов/суффиксов |
| Orb of Annulment | Magic/Rare, есть снимаемые моды | Какой мод исчез | Редкость сохраняется, даже если удалён последний мод; fractured не снимается |
| Chaos | Rare | Исчезнувший мод и новый результат | Состояние после снятия используется для проверки добавления; редкость сохраняется |
| Fracturing Orb | Rare, минимум четыре явных мода, ещё нет fracture | Какой мод оказался закреплён | Один random outcome; повторный раскол уже fractured-предмета запрещён |
| Divine Orb | Изменяемые числовые моды | Новые значения существующих модов | Семейства/тиры не меняются; fractured нельзя менять; не подменять значения новым тиром |
| Divine + Omen of Sanctification | Rare | Реальные новые значения | Ставит `sanctified`; обычный крафт после этого блокируется |

По игровому определению закреплённый мод нельзя снять **или изменить**, поэтому Divine не должен менять его значения. Запрет выбирать раскрытый/нераскрытый Desecrated мод целью Fracturing широко подтверждается игровыми наблюдениями, но не сформулирован в коротком datamined tooltip Fracturing Orb; такую проверку следует обозначать как дополнительное правило модели, а не как рассчитанную вероятность. Скрытый мод учитывается в количестве модов предмета.

Sanctification применяет к каждому модификатору множитель от 78% до 122%. Для ручного ввода освящённого исхода обычные пределы диапазона тира не подходят. Правила округления, взаимодействие всех специальных модов и исключения из запрета последующих действий не выводятся из одного tooltip; приложение не должно их выдумывать.

Источники: [Annulment](https://poe2db.tw/us/Orb_of_Annulment), [Fracturing](https://poe2db.tw/us/Fracturing_Orb), [Fractured](https://poe2db.tw/us/Fractured_Modifiers), [Divine](https://poe2db.tw/us/Divine_Orb), [Sanctified](https://poe2db.tw/us/Sanctified_Items).

## Эссенции, сплавы и crafted-слот

| Группа | Редкость до применения | Эффект |
|---|---|---|
| Lesser / обычная / Greater Essence | Magic | Переводит в Rare, сохраняет имеющиеся моды и добавляет конкретный гарантированный мод |
| Perfect Essence | Rare | Снимает случайный мод и добавляет гарантированный мод соответствующей эссенции |
| Corrupted Essence | Rare | Снимает случайный мод и добавляет гарантированный специальный мод; класс вещи важен |
| Alloy | Подходящий класс Rare | Снимает случайный мод и добавляет гарантированный crafted-мод сплава |

Гарантированные эффекты необходимо брать из строки **данной эссенции и данного класса вещи**. Perfect Essence — не «та же эссенция с лучшим тиром»: её эффект может быть совершенно другим. Например Haste разных рангов даёт скорость атак, а Perfect Haste — шанс получить Onslaught при убийстве атакой этим оружием. У разных баз одна эссенция может давать разные значения или не применяться.

**Уровни гарантированных модов.** Проверенные raw popup Lesser/Greater/Perfect Abrasion, Corrupted Hysteria и Sovereign Alloy не содержат Minimum Item Level / Minimum Modifier Level; в них указаны редкость и подходящие классы. Числа `DropLevel` валюты, `Level` строки мода и `Required Level` результата нельзя автоматически превращать в минимум ilvl для применения эссенции/сплава. Например у Perfect Abrasion валюта имеет DropLevel72, а таблица эффекта показывает Required Level57; это разные поля. Общий запрет `guaranteedMod.level > item.ilvl` не подтверждён использованными первичными текстами и не должен блокировать запись наблюдённого гарантированного результата. Ограничение `mod.level <= ilvl` для обычного random-roll остаётся. Отсутствие уровня в tooltip — граница подтверждения, а не доказательство, что никакая отдельная эссенция никогда не имеет собственного ограничения; явные поля ограничения конкретной валюты должны иметь приоритет.

Базовый лимит — **один crafted-мод**. Не подменять его правилом «после случайного удаления существующего crafted можно попытаться добавить новый»: пригодность гарантированного крафта проверяется до операции. Дополнительный разрешённый crafted-мод даёт [Astrid's Creativity](https://poe2db.tw/us/Astrids_Creativity): augment socket, `Limited to: 1`. Он не снимает обычных лимитов префиксов/суффиксов и конфликтов семейств.

Для полной вещи guaranteed replacement должен оставлять место для своей стороны. Случайно снятый префикс не позволяет добавить четвёртый суффикс. Проверка действительного результата должна учитывать эту вместимость, не изображая свободный выбор игроком снимаемого мода. Снятый мод не может быть fractured.

Источники и точные эффекты: [Essence](https://poe2db.tw/us/Essence), [Perfect Haste](https://poe2db.tw/us/Perfect_Essence_of_Haste), [Essence of Hysteria](https://poe2db.tw/us/Essence_of_Hysteria), [Crafted Modifiers](https://poe2db.tw/us/Crafted_Modifiers), [Alloy](https://poe2db.tw/us/Alloy), [Sovereign Alloy](https://poe2db.tw/us/Sovereign_Alloy).

## Омены и их совместимость

Омен активируется перед соответствующей операцией. **Потребляется при срабатывании**, не просто при выборе в интерфейсе. Одновременно может применяться несколько совместимых эффектов: глобальное ограничение «один омен на крафт» неверно. Полной верифицированной числовой границы количества совместимых оменов в использованных игровых текстах нет.

| Семейство | Ограничение/изменение операции |
|---|---|
| Sinistral / Dextral Alchemy | Максимум префиксов / суффиксов при Alchemy |
| Sinistral / Dextral Coronation | Regal добавляет только префикс / суффикс |
| Sinistral / Dextral Exaltation | Exalted добавляет только префиксы / суффиксы |
| Greater Exaltation | Exalted добавляет два мода вместо одного |
| Homogenising Coronation / Exaltation | Добавляемый мод относится к тому же типу, что существующий мод |
| Catalysing Exaltation | Exalted расходует Catalyst Quality и повышает вероятность соответствующего типа; это не гарантирование типа |
| Greater Annulment | Annulment снимает два мода |
| Sinistral / Dextral Annulment | Annulment снимает только префиксы / суффиксы |
| Sinistral / Dextral Erasure | Chaos снимает только префикс / суффикс; не ограничивает автоматически сторону добавления |
| Whittling | Chaos снимает мод с наименьшим **уровнем модификатора**, не худшим номером тира |
| Sinistral / Dextral Crystallisation | Perfect/Corrupted Essence снимает только префикс / суффикс |
| Sinistral / Dextral Necromancy | Desecration добавляет только префиксы / суффиксы |
| Blackblooded / Liege / Sovereign | Weapon/Jewellery desecration гарантирует соответственно Kurgal / Amanamu / Ulaman |
| Abyssal Echoes | При раскрытии можно один раз перебросить предложенные варианты |
| Light | Annulment снимает только Desecrated |
| Putrefaction | Desecration заменяет все моды, создаёт до шести скрытых модов и оскверняет |
| Chance / Ancients | Chance соответственно не уничтожает вещь / даёт случайный Unique того же item class |
| Corruption | Vaal обязательно приводит к изменению |
| Sanctification | Divine на Rare освящает вещь |

**Homogenising и слово type.** Tooltip говорит «same type», не «тот же префикс/суффикс». Общепринятая механическая интерпретация — общие теги модификаторов (`life`, `caster`, `fire`, `damage` и т. п.). Это отдельное измерение от стороны аффикса: Homogenising может сочетаться с side-оменом. Исчерпывающий список учитываемых тегов, работа с implicit/augment-модами и порядок пересчёта тегов при двойном добавлении не раскрыты самим tooltip. В модели следует использовать явные теги обычных модов и указывать эту границу подтверждения.

Правила совместимости безопаснее выражать пересечением ограничений. Противоположные Sinistral/Dextral одной операции конфликтуют. Greater + подходящая сторона могут сочетаться, если есть место/кандидаты для двух модов. Light + side применяет оба ограничения к снимаемому пулу. Разные гарантии lich-пулов нельзя автоматически объявлять совместимыми. Омен не своей операции не расходуется. Не считать любые разные имена совместимыми только потому, что они различаются.

Первичные тексты эффектов: [Omen](https://poe2db.tw/us/Omen), [Homogenising](https://poe2db.tw/us/Omen_of_Homogenising_Exaltation), [Catalysing](https://poe2db.tw/us/Omen_of_Catalysing_Exaltation), [Whittling](https://poe2db.tw/us/Omen_of_Whittling), [Sanctification](https://poe2db.tw/us/Omen_of_Sanctification). Дополнительное подтверждение stacking с конкретным примером Greater + Sinistral Annulment: [PoE2 Wiki — Omen](https://www.poe2wiki.net/wiki/Omen).

Наличие записи омена в PoE2DB не доказывает, что он выпадает в текущей лиге. **Официальные примечания 0.5.0** относят Omen of Corruption, Homogenising Coronation и Homogenising Exaltation к обмену только в Standard; их нельзя без отметки Legacy/Standard рекомендовать для новой лиги. Официальные 0.3.0 прекращают получение Greater Annulment, Sinistral/Dextral Alchemy и Sinistral/Dextral Coronation. Возвращение последних пяти не подтверждено использованными первичными источниками. Тексты их эффектов оставлены в матрице для полного каталога, а не как утверждение доступности.

Источники доступности: [официальные 0.5.0, раздел Expedition](https://www.pathofexile.com/forum/view-thread/3932540), [официальные 0.3.0, Item Changes](https://www.pathofexile.com/forum/view-thread/3826682).

## Бездна: кость, скрытый мод, раскрытие

1. Кость применяется к подходящей Rare-вещи и добавляет `Unrevealed Desecrated` мод. Если вещь полна, снимается случайный мод. Снятие и добавление — один подтверждённый исход.
2. Пока на вещи есть Desecrated-мод, повторная обычная кость недоступна. Скрытый и раскрытый варианты занимают этот лимит.
3. В Well of Souls игрок видит варианты и выбирает результат. Сначала следует записать показанные варианты/факт reroll, затем выбранный мод. Приложение не знает выпавшую тройку заранее.
4. **Раскрытие может предложить обычный базовый мод**, а не только эксклюзивный Desecrated-пул. Он всё равно получен через desecration и должен сохранять этот признак.
5. Abyssal Echoes относится к раскрытию; Necromancy и lich-гарантии — к попытке desecration. Не расходовать все эти омены одним общим событием.

| Кость | Подходящие вещи | Уровни |
|---|---|---|
| Jawbone | Weapon / Quiver | Gnawed: ilvl не выше 64; Preserved: без этого лимита; Ancient: minimum modifier level 40 |
| Rib | Armour | Те же Gnawed / Preserved / Ancient правила |
| Collarbone | Amulet / Ring / Belt | Те же правила; Altered Collarbone дополнительно допускает otherworldly-моды |
| Preserved Cranium | Rare Jewel | Отдельный jewel-пул и его ограничения |
| Preserved Vertebrae | Rare Waystone | Отдельные map-моды, не моды экипировки |

У нагрудников, шлемов, перчаток и сапог нет эксклюзивных Desecrated-префиксов; это **не запрет обычных префиксов при раскрытии**. У скипетров нет эксклюзивных Desecrated-модов. Обычные семейства по-прежнему конфликтуют.

`Mark of the Abyssal Lord`, полученный через Essence of the Abyss, имеет особое правило: desecration всегда удаляет сам Mark и заменяет его скрытым модом более высокого тира. Не выбирать произвольный другой мод как снятый в этом случае. Putrefaction — отдельный режим: до шести скрытых модов и осквернение, а не обычное последовательное применение шести костей. Для unstable jewels возможен риск уничтожения при повторной обработке; вероятность не задана.

Источники: [Desecrated Modifiers](https://poe2db.tw/us/Desecrated_Modifiers), [Gnawed Jawbone](https://poe2db.tw/us/Gnawed_Jawbone), [Ancient Jawbone](https://poe2db.tw/us/Ancient_Jawbone), [Essence of the Abyss](https://poe2db.tw/us/Essence_of_the_Abyss), [Abyssal Echoes](https://poe2db.tw/us/Omen_of_Abyssal_Echoes), [Putrefaction](https://poe2db.tw/us/Omen_of_Putrefaction).

## Качество, катализаторы и гнёзда

| Операция | Проверяемое изменение |
|---|---|
| Blacksmith's Whetstone | Качество Martial Weapon |
| Arcanist's Etcher | Качество wand / staff / sceptre |
| Armourer's Scrap | Качество armour |
| Catalyst | Качество соответствующего типа ring/amulet; другой catalyst заменяет тип |
| Refined Catalyst | Аналогичная операция для jewel |
| Artificer's Orb | Одно Augment Socket на Martial Weapon, wand, staff или armour, при наличии допустимого места |
| Rune / Soul Core / Idol и другие Augment | Эффект по классу вещи и конкретному socketable; вставка/замена в существующем socket |
| Vaal quality Infuser | Только item соответствующего класса уже **на максимальном качестве или выше**; повышение выше обычного maximum вплоть до +10, возможное осквернение |

Базовое maximum quality = 20%. Оно может быть изменено свойством базы/предмета: Breach Ring добавляет 20 к maximum, Refined Breach Ring — 25. Поэтому потолок Vaal Infuser зависит от **исходного максимума**, а не всегда равен 30. Примеры: default 20 → до 30; Breach Ring 40 → до 50; Refined Breach Ring 45 → до 55. Не увеличивать сохранённый intrinsic cap на 10 при каждом клике: иначе возникнет бесконечное качество. Хранить обычный cap и текущее overcap-качество раздельно.

Сами tooltips не задают исчерпывающие вероятности/размер прироста от обычной валюты и Infuser. Ввод реального нового качества и `corrupted` предпочтительнее выдуманного +1 или шанса. Quality масштабирует свойства по типу вещи; это не означает, что приложение уже умеет вычислять все итоговые характеристики.

Есть различие между формулировками: [официальные 0.5.0](https://www.pathofexile.com/forum/view-thread/3932540) задают для Infusers качество не ниже 20%, а текущие item popup — не ниже maximum quality. Для обычного cap20 это одинаково; для повышенного cap — нет. Матрица выше использует более строгую текущую формулировку tooltip. До проверки в игре не утверждать точное поведение на Breach Ring только по старым patch notes.

Augment можно заменить, но обычным способом извлечь обратно нельзя. Стат `Limited to` и дополнительные crafted/affix/socket allowances требуют отдельных проверок. Максимум socket не следует жёстко выводить только из размера оружия: специальные базы, corruption и другие моды могут менять его.

Источники: [Quality](https://poe2db.tw/us/Quality), [Vaal Armourer's Infuser](https://poe2db.tw/us/Vaal_Armourers_Infuser), [Vaal Catalysing Infuser](https://poe2db.tw/us/Vaal_Catalysing_Infuser), [Artificer's Orb](https://poe2db.tw/us/Artificers_Orb), [Augment](https://poe2db.tw/us/Augment).

## Завершающие и особые операции

| Операция | Правило |
|---|---|
| Vaal Orb | Непредсказуемое изменение и `corrupted`; полный результат вносит игрок, затем обычные действия блокируются |
| Architect's Orb | Работает с **Corrupted Equipment / Jewel**, меняет его или уничтожает; не следует глобально блокировать из-за `corrupted` |
| Yaomac's Orb of Sacrifice | Rare corrupted Weapon/Quiver: улучшает Corruption Enchantment и снимает random modifier |
| Kopec's Orb of Sacrifice | Аналогично для Rare corrupted Armour |
| Kamasa's Orb of Sacrifice | Аналогично для Rare corrupted Amulet/Ring/Belt |
| Yugul's Orb of Sacrifice | Аналогично для Rare corrupted Jewel |
| Orb of Chance | Normal → Unique или уничтожение; с Chance omen возможен сохранённый предмет, с Ancients — Unique того же item class |
| Mirror of Kalandra | Создаёт mirrored copy экипируемого non-unique предмета; **оригинал не становится mirrored** |
| Hinekora's Lock | Даёт возможность посмотреть next-currency outcome в игре; любое изменение снимает foresight. Без игрового preview приложение не знает исход |
| Perfect Flux | Поднимает granted Skills на предмете до уровня 20 |
| Core Destabiliser | Изменяет или уничтожает Soul Core; это обработка socketable, не прямое изменение базы экипировки |
| Blazing / Chilling / Crackling Flux | Переводит все соответствующие сопротивления других стихий в fire / cold / lightning по таблице эквивалентности модов |
| Void Flux | Переводит fire/cold/lightning resistance mods в эквивалентные chaos resistance mods |

Flux сопротивлений — не обычное добавление нового random-мода. Нельзя просто заменить русское слово в тексте, сложить проценты или прогнать результат через обычный запрет повторного random-roll одного семейства. У страниц валют есть таблица Mod Equivalences; ей и наблюдаемому результату нужно отдавать приоритет. При невыясненных правилах переноса типа/значений/флагов требуется полная запись реального исхода.

Источники: [Vaal](https://poe2db.tw/us/Vaal_Orb), [Architect](https://poe2db.tw/us/Architects_Orb), [Yaomac](https://poe2db.tw/us/Yaomacs_Orb_of_Sacrifice), [Kopec](https://poe2db.tw/us/Kopecs_Orb_of_Sacrifice), [Kamasa](https://poe2db.tw/us/Kamasas_Orb_of_Sacrifice), [Yugul](https://poe2db.tw/us/Yuguls_Orb_of_Sacrifice), [Chance](https://poe2db.tw/us/Orb_of_Chance), [Mirror](https://poe2db.tw/us/Mirror_of_Kalandra), [Lock](https://poe2db.tw/us/Hinekoras_Lock), [Perfect Flux](https://poe2db.tw/us/Perfect_Flux), [Core Destabiliser](https://poe2db.tw/us/Core_Destabiliser), [Blazing Flux](https://poe2db.tw/us/Blazing_Flux), [Void Flux](https://poe2db.tw/us/Void_Flux).

## Verisium, Alloy и Runeforging

Это три разных действия, их нельзя объединять в generic «добавить Runic Ward»:

1. **Runeforging на наковальне** выбирается по конкретному рецепту базы. Рецепт определяет новую базу, базовые защиты/урон/Runic Ward и необходимые материалы. В таблице встречаются разные затраты Verisium, Exceptional Verisium и Crest. Нужно записывать точную новую базу/вариант из игрового результата, не менять только название старой базы.
2. **Alloy** — гарантированный мод на подходящем Rare, с удалением random modifier и занятием crafted-слота; это операция над аффиксами, а не рецепт смены базы. Тринадцать типов: Runic, Adaptive, Protective, Expansive, Swift, Cyclonic, Prismatic, Mystic, Sovereign, Celestial, Transcendent, The Runebinder's, The Runefather's. Точные эффекты зависят от класса вещи.
3. **Liquid Verisium** запускает Runic Remnant encounter со случайной inscription. Оно само по себе не меняет item modifiers и не должно предлагаться вместо валюты крафта вещи.

Таблица Runeforging содержит также Unique/Runemastered-рецепты. Порог «ниже/выше уровня 55» в описании касается видов баз/рецептов и их защит, его нельзя без дополнительной проверки превращать в условие `item.ilvl < 55`. Для обычной брони ранние рецепты добавляют Ward, высокие могут уменьшать прежние базовые защиты. Unique-рецепты могут давать разные варианты; у рецепта нужно проверить требуемый unlock. При неизвестном переносе свойств записывается полный наблюдаемый результат, а не выдуманный автоматический reroll.

Источники: [Runeforging и рецепты](https://poe2db.tw/us/Runeforging), [Verisium](https://poe2db.tw/us/Verisium), [Exceptional Verisium](https://poe2db.tw/us/Exceptional_Verisium), [Alloy](https://poe2db.tw/us/Alloy), [Liquid Verisium](https://poe2db.tw/us/Liquid_Verisium).

## Проверки полноты и честности

- Не добавлять PoE1 Alteration/Scouring, fossils, harvest/metacrafts только потому, что такие механики есть в первой игре.
- Исторический Recombinator нельзя представлять как текущую доступную операцию. Его отключение и удаление Omen of Recombination подтверждены [официальными 0.5.0, Expedition](https://www.pathofexile.com/forum/view-thread/3932540); наличие старых записей в датамайне не отменяет отключение.
- Не заявлять полный математически оптимальный маршрут, точные шансы, ожидаемую цену успеха или наличие в лиге на основании одних popup-описаний.
- Каталог поддерживаемых действий, двигатель валидации и ручная запись особого результата — разные уровни поддержки. Экран и release notes должны честно различать их.
- Не вычислять «шанс 1/N» для fracturing/annulment, пока не верифицированы кандидаты, иммунитеты и равномерность выбора. Для текущего помощника достаточно валидировать реально выбранный игрой исход.
- Экспорт проекта должен сохранять состояния модов, quality/cap, socketables, active omens и историю операций. Старые проекты без этих полей нуждаются в миграции с явными безопасными значениями.
