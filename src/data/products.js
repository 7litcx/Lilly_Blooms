export const PRODUCTS = [
  {
    id: 'pink-lily-dream',
    name: 'حلم الزنبق الوردي',
    category: 'باقات',
    price: 25000,
    originalPrice: 29000,
    rating: 5.0,
    reviewsCount: 0,
    badge: 'الأكثر مبيعاً',
    image: '/images/pink-lily-hero.jpg',
    description: 'باقتنا الأيقونية المنسّقة يدوياً، تتألق بزهور الزنبق والورد بدرجات الوردي والعاجي الفاخر، ملفوفة بورق بليسيه ياباني مع شريط أورجانزا حريري وردي.',
    details: [
      'زهور منتقاة بعناية فائقة بملمس طبيعي نضر',
      'مطعّمة بأوراق خضراء طبيعية ولمسات نباتية خلابة',
      'تغليف ياباني فاخر متعدد الطبقات ومقاوم للماء',
      'شريط أورجانزا حريري وردي مميز مرفق مع الباقة',
      'تصل في صندوق هدايا فاخر مع كرت إهداء مخصص'
    ],
    inStock: true,
  },
  {
    id: 'blushing-romance',
    name: 'رومانسية الورد',
    category: 'رومانسية',
    price: 22000,
    originalPrice: 25000,
    rating: 4.9,
    reviewsCount: 0,
    badge: null,
    image: '/images/blushing-romance.jpg',
    description: 'مزيج شاعري رقيق من ورود الحدائق الوردية، أزهار الأقحوان البيضاء وأوراق الأوكالبتوس العطرية، مغلفة بورق وردي ناعم يفيض بالحب والرقة.',
    details: [
      '12 وردة فاخرة مع تشكيلة أزهار تكميلية متناغمة',
      'أوراق الأوكالبتوس ونبات الجبسوفيليا الخلاب',
      'تغليف أنيق بدرجتين متناغمتين من الوردي الهادئ',
      'كرت إهداء مجاني مكتوب بخط اليد عند الطلب'
    ],
    inStock: true,
  },
  {
    id: 'pure-elegance',
    name: 'النقاء الفاخر',
    category: 'باقات',
    price: 26000,
    originalPrice: 30000,
    rating: 5.0,
    reviewsCount: 0,
    badge: 'الأكثر مبيعاً',
    image: '/images/pure-elegance.jpg',
    description: 'زهور الليلي والزنبق الملكي الأبيض النقي محاطة بلمسات من الورود العاجية والوردية الهادئة، تجسد أسمى معاني النقاء والوفاء والرقي.',
    details: [
      'زهور ليلي شرقية فاخرة وورود كريمية نادرة',
      'تنسيق حلزوني متناغم بأيدي أمهر خبراء الزهور',
      'تغليف عاجي ملكي بطبقات متعددة وشريط حريري',
      'ضمان الحفاظ على نضارة الزهور لأطول فترة'
    ],
    inStock: true,
  },
  {
    id: 'sweet-serenity',
    name: 'سكينة ناعمة',
    category: 'أعياد الميلاد',
    price: 20000,
    originalPrice: 23000,
    rating: 4.8,
    reviewsCount: 0,
    badge: null,
    image: '/images/sweet-serenity.jpg',
    description: 'سيمفونية متناغمة من ورود الشاي الوردية وزهور الهيدرانجيا الليلكية مع نفحات عطرية لطيفة تبهج الروح وتنشر السعادة والبهجة.',
    details: [
      'ورود شاي وردية وزهور هيدرانجيا هولندية فاخرة',
      'ملمس مخملي ورائحة زهرية فوّاحة وأخاذة',
      'تغليف هادئ متناغم مع شريط ناعم',
      'مثالية لأعياد الميلاد والاحتفالات الخاصة'
    ],
    inStock: true,
  }
];

export const CATEGORIES = [
  {
    id: 'bouquets',
    title: 'باقات الورد',
    subtitle: 'زهور نضرة وفاخرة لكل مناسبة',
    image: '/images/cat-bouquets.jpg',
    tag: 'جميع الباقات'
  },
  {
    id: 'birthday',
    title: 'أعياد الميلاد',
    subtitle: 'احتفل بأجمل اللحظات والذكريات',
    image: '/images/cat-birthday.png',
    tag: 'باقات الميلاد'
  },
  {
    id: 'romantic',
    title: 'رومانسية',
    subtitle: 'عبّر عن أصدق مشاعرك بأجمل زهور',
    image: '/images/cat-romantic.jpg',
    tag: 'الحب والرومانسية'
  },
  {
    id: 'gifts',
    title: 'هدايا تخرج',
    subtitle: 'تنسيقات تخرج مميزة تسعد خريجك',
    image: '/images/cat-graduation.jpg',
    tag: 'هدايا التخرج'
  }
];
