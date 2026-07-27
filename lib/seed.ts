import { db } from "@/lib/db";
import { ensureBootstrapAdmin } from "@/lib/auth";

const CATEGORIES = [
  { slug: "self-development", name: "توسعه فردی" },
  { slug: "business", name: "کسب‌وکار" },
  { slug: "mindfulness", name: "ذهن‌آگاهی" },
];

const TAGS = [
  { slug: "self-development", name: "توسعه فردی" },
  { slug: "decision-making", name: "تصمیم‌گیری" },
  { slug: "purpose", name: "هدف‌مندی" },
  { slug: "migration", name: "مهاجرت" },
  { slug: "acceptance", name: "پذیرش" },
  { slug: "mindfulness", name: "ذهن‌آگاهی" },
  { slug: "business", name: "کسب‌وکار" },
  { slug: "relationships", name: "روابط" },
];

const SAMPLE_AUDIO = "/audio-sample/sample.wav";

const PODCASTS = [
  {
    slug: "to-az-no-episode-1",
    episode_number: 4,
    title: "قدرت پنهان در مکث‌های کوتاه",
    subtitle: "چگونه مکث‌ها ما را حرکت می‌دهند؟",
    description: "گاهی کوتاه‌ترین مکث، روشن‌ترین پاسخ را به ما نشان می‌دهد؛ روایتی درباره توقف، دیدن و انتخاب دوباره.",
    summary: "## در این اپیزود چه می‌شنوید؟\n\nاز مکث‌هایی حرف می‌زنیم که به‌ظاهر هیچ اتفاقی در آن‌ها نمی‌افتد، اما مسیر تصمیم‌های بعدی ما را تغییر می‌دهند.\n\n- چرا سرعت همیشه نشانه پیشرفت نیست\n- چطور صدای نیازهای واقعی‌مان را بشنویم\n- یک تمرین کوتاه برای ساختن فاصله میان محرک و پاسخ\n\n> ما برای پیدا کردن مسیر درست، به سرعت بیشتر نیاز نداریم؛ به سکوتی نیاز داریم تا صدای مسیر را بشنویم.",
    transcript: "## مکث، فضای خالی نیست\n\nزندگی مدرن ما را به واکنش فوری عادت داده است. پیام‌ها، تصمیم‌ها و نگرانی‌ها فرصت دیدن را از ما می‌گیرند. مکث کردن یعنی ساختن فضایی کوچک برای مشاهده؛ فضایی که در آن مجبور نیستیم همان پاسخ همیشگی را تکرار کنیم.\n\n## وقتی سرعت کم می‌شود\n\nدر سکوت کوتاه، بدن و ذهن فرصت پیدا می‌کنند اطلاعاتی را که در شلوغی نادیده گرفته‌ایم دوباره کنار هم بگذارند. این توقف، عقب‌نشینی نیست؛ بخشی از حرکت آگاهانه است.\n\n## تمرین این هفته\n\nپیش از یک تصمیم روزمره، سه نفس آرام بکشید و از خودتان بپرسید: «اگر لازم نبود فوری پاسخ بدهم، چه چیزی را انتخاب می‌کردم؟»",
    cover_url: "/design/podcast-cover.webp",
    duration_seconds: 2400,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["self-development", "decision-making", "purpose"],
    play_count: 486,
  },
  {
    slug: "to-az-no-episode-2",
    episode_number: 5,
    title: "سایه‌های مهاجرت؛ احساس گناه جا ماندن",
    subtitle: "وقتی رفتن و ماندن هم‌زمان در ما زندگی می‌کنند",
    description: "گفت‌وگویی درباره احساس گناه، دلتنگی و ساختن خانه‌ای تازه بدون انکار ریشه‌ها.",
    summary: "## میان رفتن و ماندن\n\nمهاجرت فقط تغییر جغرافیا نیست؛ بازتعریف رابطه ما با خانه، خانواده و خودمان است.",
    transcript: "## احساس گناه از کجا می‌آید؟\n\nگاهی رشد کردن در جایی تازه، شبیه جا گذاشتن آدم‌های مهم زندگی به نظر می‌رسد. در این اپیزود یاد می‌گیریم این دو تجربه می‌توانند هم‌زمان واقعی باشند.",
    cover_url: "/design/fog-path.webp",
    duration_seconds: 2700,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["migration", "acceptance"],
    play_count: 421,
  },
  {
    slug: "kasb-o-kar-modern",
    episode_number: 6,
    title: "کمال‌گرایی؛ دشمن شماره یک شروع کردن",
    subtitle: "چرا منتظر نسخه بی‌نقص می‌مانیم؟",
    description: "راه‌هایی عملی برای عبور از کمال‌گرایی و آغاز کردن با نسخه‌ای کوچک اما واقعی.",
    summary: "## شروع ناقص\n\nحرکت کوچک امروز از برنامه بی‌نقص فردا ارزشمندتر است.",
    transcript: "## استاندارد یا ترس؟\n\nمیان کیفیت‌خواهی و کمال‌گرایی مرزی ظریف وجود دارد. یکی ما را جلو می‌برد و دیگری شروع را به تعویق می‌اندازد.",
    cover_url: "/design/gold-line.webp",
    duration_seconds: 3200,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["business", "purpose", "decision-making"],
    play_count: 375,
  },
  {
    slug: "zehn-agahi-101",
    episode_number: 7,
    title: "تغییرات بی‌صدا، نتایج ماندگار",
    subtitle: "قدرت قدم‌های کوچک و پیوسته",
    description: "چرا تغییرهای آرام بیشتر از جهش‌های هیجانی در زندگی ما باقی می‌مانند؟",
    summary: "## تغییر ارگانیک\n\nبه جای فشار، محیطی می‌سازیم که رفتار تازه بتواند در آن رشد کند.",
    transcript: "## کوچک اما پیوسته\n\nتغییر پایدار معمولاً نمایشی نیست. در انتخاب‌های روزمره و تکرارهای کوچک شکل می‌گیرد.",
    cover_url: "/design/dunes-alt.webp",
    duration_seconds: 1800,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["mindfulness", "self-development"],
    play_count: 298,
  },
  {
    slug: "rabete-salem",
    episode_number: 8,
    title: "هم‌گم شدن در مسیر جدید",
    subtitle: "وقتی هویت قدیمی دیگر کافی نیست",
    description: "درباره دوره‌ای که مسیر گذشته تمام شده اما مسیر تازه هنوز نام و شکل مشخصی ندارد.",
    summary: "## میان دو نسخه از خود\n\nابهام همیشه نشانه گم‌شدن نیست؛ گاهی نشانه ساخته‌شدن است.",
    transcript: "## فضای میانی\n\nقرار نیست همه پاسخ‌ها از ابتدا روشن باشند. بعضی مسیرها در حرکت آرام آشکار می‌شوند.",
    cover_url: "/design/coast.webp",
    duration_seconds: 2100,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["migration", "self-development", "acceptance"],
    play_count: 244,
  },
  {
    slug: "paziresh-sayeha",
    episode_number: 9,
    title: "پذیرش سایه‌ها در مسیر جدید",
    subtitle: "دیدن بخش‌هایی که پنهان کرده‌ایم",
    description: "پذیرش خود به معنی تسلیم شدن نیست؛ نقطه شروع یک رابطه صادقانه‌تر با خودمان است.",
    summary: "## دیدن بدون قضاوت\n\nبخش‌های نادیده ما نیز حامل اطلاعات و نیازهای مهم‌اند.",
    transcript: "## سایه‌ها دشمن نیستند\n\nوقتی تجربه‌های دشوار را با کنجکاوی می‌بینیم، امکان انتخاب تازه‌ای به وجود می‌آید.",
    cover_url: "/design/ripple-stone.webp",
    duration_seconds: 2280,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["acceptance", "mindfulness"],
    play_count: 187,
  },
  {
    slug: "bazgasht-be-khod",
    episode_number: 10,
    title: "بازگشت به خود پس از یک تغییر بزرگ",
    subtitle: "بازسازی اعتماد در مسیر تازه",
    description: "چگونه پس از یک دوره تغییر، دوباره با ارزش‌ها و نیازهای واقعی خود ارتباط برقرار کنیم؟",
    summary: "## بازگشت آرام\n\nخودشناسی یک مقصد ثابت نیست؛ رابطه‌ای است که باید دوباره و دوباره ساخته شود.",
    transcript: "## بعد از تغییر\n\nوقتی شرایط بیرونی عوض می‌شود، تعریف ما از خود نیز نیاز به بازنگری پیدا می‌کند.",
    cover_url: "/design/ripple-stone-alt.webp",
    duration_seconds: 2520,
    producer: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["self-development", "purpose", "acceptance"],
    play_count: 142,
  },
];

const CHAPTERS = [
  { title: "مقدمه و تعریف مکث", start_seconds: 0 },
  { title: "چرا همیشه عجله داریم؟", start_seconds: 240 },
  { title: "فاصله میان محرک و پاسخ", start_seconds: 720 },
  { title: "تمرین سه نفس", start_seconds: 1440 },
  { title: "جمع‌بندی", start_seconds: 2100 },
];

const ARTICLES = [
  {
    slug: "bavarhaye-jaygozin",
    title: "معماری سکوت؛ طراحی فضاهای خالی در تقویم روزانه",
    excerpt: "چطور با ساختن فضای خالی، اضطراب تصمیم‌ها را کمتر و کیفیت انتخاب‌ها را بیشتر کنیم؟",
    body: "## چرا خلأ مهم است؟\n\nتقویم‌های فشرده فقط زمان ما را پر نمی‌کنند؛ توان دیدن، فکر کردن و بازیابی انرژی را هم محدود می‌کنند. فضای خالی در برنامه، زمان تلف‌شده نیست. بخشی از معماری یک زندگی آگاهانه است.\n\n## توهم بهره‌وری و اضطراب تقویم‌های پُر\n\nوقتی ارزش خود را با تعداد کارهای انجام‌شده اندازه می‌گیریم، هر فاصله‌ای در برنامه شبیه عقب‌ماندن به نظر می‌رسد. نتیجه این است که حتی استراحت هم به پروژه‌ای برای بهترشدن تبدیل می‌شود.\n\n> یک تقویم سالم فقط کارهای مهم را نشان نمی‌دهد؛ برای بازیابی و فکر کردن نیز جا نگه می‌دارد.\n\n![شبکه‌ای از فضاهای روشن در تاریکی](/design/article-grid.webp)\n\n## چگونه سکوت را معماری کنیم؟\n\nسکوت لزوماً نبود صدا نیست. گاهی تصمیمی آگاهانه است برای اینکه هر درخواست، پیام یا نگرانی فوراً وارد برنامه ما نشود. همان‌طور که یک معمار میان دیوارها فضای تنفس باقی می‌گذارد، ما هم می‌توانیم میان تعهدها فاصله‌هایی واقعی بسازیم.\n\nاین فاصله‌ها کمک می‌کنند بفهمیم کدام کار واقعاً مهم است و کدام کار فقط از ترس عقب‌ماندن پذیرفته شده. بدون این مکث، برنامه روزانه به فهرستی از واکنش‌ها تبدیل می‌شود و فرصت انتخاب از بین می‌رود.\n\n## مرزهای زمانی روشن\n\nفضای خالی زمانی پایدار می‌ماند که از آن محافظت کنیم. خاموش‌کردن اعلان‌ها، مشخص‌کردن ساعت پایان کار و نپذیرفتن جلسه‌های پشت سر هم، مرزهایی ساده اما مؤثرند. این مرزها به دیگران هم نشان می‌دهند که دسترسی دائمی، شرط همکاری خوب نیست.\n\nدر آغاز ممکن است این کار با احساس گناه همراه باشد. ذهنی که به شلوغی عادت کرده، آرامش را با کم‌کاری اشتباه می‌گیرد. با تکرار، بدن و ذهن یاد می‌گیرند که استراحت و تأمل نیز بخشی از کار عمیق‌اند.\n\n## طراحی فضای خالی\n\n1. میان جلسه‌ها حداقل پانزده دقیقه فاصله بگذارید.\n2. هفته‌ای یک بازه بدون خروجی تعریف کنید.\n3. پیش از پذیرفتن تعهد تازه، هزینه انرژی آن را بسنجید.\n\n## مکث کردن یک مهارت آموختنی است\n\nبا تکرار، بدن یاد می‌گیرد که سکوت خطر نیست. از همین نقطه است که انتخاب‌های تازه امکان‌پذیر می‌شوند.",
    cover_url: "/design/article-stage.webp",
    author: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["self-development", "mindfulness"],
    view_count: 824,
    read_time_minutes: 8,
  },
  {
    slug: "lahze-hal",
    title: "لنگرگاه‌های نامرئی؛ چگونه در جغرافیای جدید ریشه بدوانیم؟",
    excerpt: "ریشه‌داشتن همیشه به معنی ماندن در یک مکان نیست؛ گاهی از رابطه‌ها و آیین‌های کوچک ساخته می‌شود.",
    body: "## خانه چگونه ساخته می‌شود؟\n\nبعد از مهاجرت، خانه دیگر فقط یک نشانی نیست. مجموعه‌ای از رابطه‌ها، عادت‌ها و معناهایی است که به زندگی روزمره ثبات می‌دهند.\n\n## لنگرهای کوچک\n\nآدم‌ها، مسیرهای تکراری، غذاها و زبان می‌توانند لنگرهایی برای ساختن حس تعلق باشند.",
    cover_url: "/design/ripple.webp",
    author: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["migration", "acceptance"],
    view_count: 702,
    read_time_minutes: 6,
  },
  {
    slug: "shoroue-kasb-kar",
    title: "شجاعت سایه کردن دیگران برای یافتن خود",
    excerpt: "گاهی تقلید آگاهانه، پلی است برای پیدا کردن زبان و مسیر شخصی خودمان.",
    body: "## یادگیری از مسیر دیگران\n\nهیچ مسیر حرفه‌ای از خلأ شروع نمی‌شود. مشاهده و تمرین الگوهای موفق می‌تواند نقطه شروعی برای ساختن صدای شخصی باشد.",
    cover_url: "/design/ripple-stone.webp",
    author: "برزو ذاکری",
    category_slug: "business",
    tags: ["business", "purpose"],
    view_count: 615,
    read_time_minutes: 5,
  },
  {
    slug: "marz-haye-salem",
    title: "اتاقی چندمنظوره؛ معماری سکوت در زندگی روزمره",
    excerpt: "چگونه در خانه و برنامه روزانه، فضایی برای تمرکز و بازیابی بسازیم؟",
    body: "## فضا رفتار می‌سازد\n\nمحیط اطراف ما روی تمرکز و آرامش اثر می‌گذارد. با تغییرهای ساده می‌توان گوشه‌ای برای مکث ساخت.",
    cover_url: "/design/gold-line.webp",
    author: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["mindfulness", "self-development"],
    view_count: 498,
    read_time_minutes: 5,
  },
  {
    slug: "modiriat-zaman",
    title: "مقاومت پنهان انتخاب‌هایی که نکرده‌ایم",
    excerpt: "چرا بعضی تصمیم‌ها حتی پس از انتخاب، همچنان انرژی ذهنی ما را مصرف می‌کنند؟",
    body: "## سوگ انتخاب‌های دیگر\n\nهر انتخاب واقعی یعنی کنارگذاشتن چند امکان دیگر. پذیرفتن این فقدان، بخشی از تصمیم‌گیری بالغ است.",
    cover_url: "/design/gold-folds.webp",
    author: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["decision-making", "acceptance"],
    view_count: 376,
    read_time_minutes: 4,
  },
  {
    slug: "shenide-shodan",
    title: "نجابت شنیده شدن و درک نشدن؛ گفت‌وگویی که چه می‌گذرد؟",
    excerpt: "شنیده‌شدن همیشه به معنی موافقت نیست؛ اما بدون شنیدن، گفت‌وگو شکل نمی‌گیرد.",
    body: "## شنیدن فعال\n\nشنیدن یعنی برای چند لحظه نیاز به پاسخ‌دادن را کنار بگذاریم و تجربه طرف مقابل را همان‌طور که هست دریافت کنیم.",
    cover_url: "/design/dunes.webp",
    author: "برزو ذاکری",
    category_slug: "relationships",
    tags: ["relationships", "acceptance"],
    view_count: 291,
    read_time_minutes: 5,
  },
  {
    slug: "masir-be-jaye-maghsad",
    title: "وقتی مسیر جایگزین مقصد می‌شود",
    excerpt: "رشد همیشه رسیدن نیست؛ گاهی کیفیت قدم‌هایی است که در راه برمی‌داریم.",
    body: "## زندگی در مسیر\n\nوقتی تمام توجه ما به نتیجه نهایی باشد، بخش بزرگی از تجربه زندگی نادیده می‌ماند. مسیر می‌تواند خودش محل یادگیری و معنا باشد.",
    cover_url: "/design/coast.webp",
    author: "برزو ذاکری",
    category_slug: "self-development",
    tags: ["purpose", "self-development"],
    view_count: 228,
    read_time_minutes: 4,
  },
];

const FAQS = [
  ["آیا محتوای سایلنت شیفت فقط برای مهاجران است؟", "نه. اگرچه بخش زیادی از تجربه من با ایرانیان مهاجر است، مسیرهای مکث و بازنگری برای هر کسی که در دوره تحول قرار دارد ارزشمند است."],
  ["رویکرد تغییر آرام دقیقاً به چه معناست؟", "به‌جای فشار و راه‌حل‌های سریع، روی تغییرات کوچک، پایدار و هم‌سو با ارزش‌های شخصی تمرکز می‌کنیم."],
  ["برای شروع، نیاز به دانش قبلی در زمینه روان‌شناسی یا توسعه فردی دارم؟", "خیر. پادکست‌ها و روایت‌ها با زبان ساده نوشته شده‌اند و از تجربه‌های روزمره شروع می‌کنند."],
  ["جلسات مشاوره و کوچینگ به چه صورتی برگزار می‌شوند؟", "جلسات آنلاین و یک‌به‌یک هستند و متناسب با شرایط شما طراحی می‌شوند."],
  ["بهترین نقطه برای شروع همراهی با شما کجاست؟", "یک گفت‌وگوی سی دقیقه‌ای رایگان از صفحه ارتباط؛ بدون تعهد و برای بررسی تناسب مسیر."],
] as const;

const SITE_CONTENT = {
  hero_title: "جایی برای مکث کردن",
  hero_subtitle: "کوچینگ و منتورینگ اختصاصی برای ایرانیان خارج از کشور؛ مسیری آرام برای رشد شخصی، حرفه‌ای و دوباره ساختن.",
  about_short: "Silent Shift از یک باور ساده شکل گرفت: بسیاری از مهم‌ترین تغییرات زندگی در لحظه‌های آرام و بی‌صدا رخ می‌دهند. اینجا فضایی برای مکث، بازنگری و ساختن قدم‌های ماندگار است.\n\nسال‌ها همراه مدیران، متخصصان و مهاجرانی بوده‌ام که میان خواسته‌های بیرونی و صدای درونی خود دنبال تعادل تازه‌ای می‌گشتند. تجربه آن‌ها به من آموخت که پاسخ‌های پایدار معمولاً از نسخه‌های آماده نمی‌آیند؛ از گفت‌وگویی صادقانه با خود آغاز می‌شوند.\n\nدر سایلنت شیفت، پادکست‌ها، روایت‌ها و جلسه‌های همراهی کنار هم قرار گرفته‌اند تا برای دیدن الگوهای قدیمی، پذیرفتن تجربه امروز و طراحی قدم بعدی فضای کافی داشته باشیم.",
  about_long: "سال‌ها فعالیت در حوزه مشاوره کسب‌وکار و توسعه فردی به من نشان داد که بزرگ‌ترین گره‌های ما در شلوغی باز نمی‌شوند. ما به دویدن عادت کرده‌ایم و گاهی فراموش می‌کنیم برای انتخاب مسیر، ابتدا باید صدای خودمان را بشنویم.\n\nSilent Shift از دل همین نیاز متولد شد؛ فضایی برای ایستادن، نگاه‌کردن به مسیر و پیدا کردن شجاعت برای قدم‌هایی بی‌صدا اما ماندگار.",
  newsletter_description: "منتخبی از پادکست‌ها، روایت‌ها و تمرین‌های کاربردی درباره رشد فردی، زندگی حرفه‌ای و تغییرات ماندگار.",
};

export async function runSeed({ force = false }: { force?: boolean } = {}) {
  await ensureBootstrapAdmin();
  const existing = db.prepare("SELECT COUNT(*) AS n FROM podcasts").get() as { n: number };
  if (existing.n > 0 && !force) return { skipped: true, reason: "Database already seeded" };

  db.transaction(() => {
    if (force) {
      db.exec(`
        DELETE FROM chapters; DELETE FROM podcast_tags; DELETE FROM article_tags;
        DELETE FROM tags; DELETE FROM podcasts; DELETE FROM articles;
        DELETE FROM categories; DELETE FROM faqs; DELETE FROM site_content;
        DELETE FROM sqlite_sequence WHERE name IN ('chapters','tags','podcasts','articles','categories','faqs');
      `);
    }

    const catIds = new Map<string, number>();
    const insertCategory = db.prepare("INSERT INTO categories (slug, name) VALUES (?, ?)");
    CATEGORIES.forEach((item) => catIds.set(item.slug, Number(insertCategory.run(item.slug, item.name).lastInsertRowid)));

    const tagIds = new Map<string, number>();
    const insertTag = db.prepare("INSERT INTO tags (slug, name) VALUES (?, ?)");
    TAGS.forEach((item) => tagIds.set(item.slug, Number(insertTag.run(item.slug, item.name).lastInsertRowid)));

    const insertPodcast = db.prepare(`
      INSERT INTO podcasts (slug, title, subtitle, description, summary, cover_url, audio_url,
        duration_seconds, episode_number, producer, category_id, apple_url, castbox_url, transcript,
        play_count, published_at)
      VALUES (@slug,@title,@subtitle,@description,@summary,@cover_url,@audio_url,@duration_seconds,
        @episode_number,@producer,@category_id,@apple_url,@castbox_url,@transcript,@play_count,@published_at)
    `);
    const insertPodcastTag = db.prepare("INSERT INTO podcast_tags (podcast_id, tag_id) VALUES (?, ?)");
    const insertChapter = db.prepare("INSERT INTO chapters (podcast_id,title,start_seconds,sort_order) VALUES (?,?,?,?)");
    PODCASTS.forEach((item, index) => {
      const id = Number(insertPodcast.run({
        ...item,
        audio_url: SAMPLE_AUDIO,
category_id: catIds.get(item.category_slug) ?? null,
        apple_url: process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL || "https://podcasts.apple.com/",
        castbox_url: process.env.NEXT_PUBLIC_CASTBOX_URL || "https://castbox.fm/",
        published_at: daysAgo(index * 7),
      }).lastInsertRowid);
      item.tags.forEach((slug) => insertPodcastTag.run(id, tagIds.get(slug)));
      if (index === 0) CHAPTERS.forEach((chapter, order) => insertChapter.run(id, chapter.title, chapter.start_seconds, order));
    });

    const insertArticle = db.prepare(`
      INSERT INTO articles (slug,title,excerpt,body,cover_url,author,category_id,read_time_minutes,view_count,published_at)
      VALUES (@slug,@title,@excerpt,@body,@cover_url,@author,@category_id,@read_time_minutes,@view_count,@published_at)
    `);
    const insertArticleTag = db.prepare("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)");
    ARTICLES.forEach((item, index) => {
      const id = Number(insertArticle.run({ ...item, category_id: catIds.get(item.category_slug) ?? null, published_at: daysAgo(index * 5) }).lastInsertRowid);
      item.tags.forEach((slug) => insertArticleTag.run(id, tagIds.get(slug)));
    });

    const insertFaq = db.prepare("INSERT INTO faqs (question,answer,sort_order) VALUES (?,?,?)");
    FAQS.forEach(([question, answer], index) => insertFaq.run(question, answer, index));
    const insertContent = db.prepare("INSERT INTO site_content (key,value) VALUES (?,?)");
    Object.entries(SITE_CONTENT).forEach(([key, value]) => insertContent.run(key, value));
  })();

  return { seeded: true, categories: CATEGORIES.length, tags: TAGS.length, podcasts: PODCASTS.length, articles: ARTICLES.length, faqs: FAQS.length, content_keys: Object.keys(SITE_CONTENT).length };
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
