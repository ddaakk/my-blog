export default {
  /**
   * basic Information
   */
  title: `rnesw.blog`,
  description: `개발자 에디`,
  language: `ko`,
  siteUrl: `https://rnesw.blog/`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder

  /**
   * comments setting
   */
  comments: {
    utterances: {
      repo: `ddaakk/my-blog`, //`danmin20/danmin-gatsby-blog`,
    },
  },

  /**
   * introduce yourself
   */
  author: {
    name: `강상우`,
    nickname: `에디`,
    stack: ['Backend', 'Kotlin', 'Java', 'Spring'],
    bio: {
      email: `sangwoo98@gmail.com`,
      residence: 'Seoul, South Korea',
      bachelorDegree: 'Hannam Univ. Computer Engineering (2016.03-2023.02)',
    },
    social: {
      github: `https://github.com/ddaakk`,
      linkedIn: `https://www.linkedin.com/in/sangwoo-kang-1b00b6214/`,
      resume: ``,
    },
    dropdown: {
      tistory: 'https://edd1e.tistory.com/',
      velog: '',
    },
  },

  /**
   * definition of featured posts
   */
  featured: [
    {
      title: 'category1',
      category: 'featured-category1',
    },
    {
      title: 'category2',
      category: 'featured-category2',
    },
  ],

  /**
   * metadata for About Page
   */
  timestamps: [
    {
      category: 'Career',
      date: '2023.02.13 - 2024.04.31',
      en: 'Codeblock',
      kr: '코드블럭',
      info: '페이태그팀',
      link: 'https://codeblock.kr',
    },
  ],

  /**
   * metadata for Playground Page
   */
  projects: [
    {
      title: 'Portfolio',
      description: '포트폴리오',
      techStack: ['Spring Boot', 'React', 'Next.js', 'Typescript'],
      thumbnailUrl: '', // Path to your in the 'assets' folder
      links: {
        post: '',
        github: '',
        demo: '',
        googlePlay: '',
        appStore: '',
      },
    },
  ],

  /**
   * metadata for Buy Me A Coffee
   */
  remittances: {
    toss: {
      link: 'https://toss.me/danmin',
      qrCode: 'toss_qr.svg', // Path to your in the 'assets' folder
    },
    kakaopay: {
      qrCode: 'kakao_qr.svg', // Path to your in the 'assets' folder
    },
  },
};
