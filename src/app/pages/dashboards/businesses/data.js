export const durationOptions = [
    {
        value: [0, 3600000],
        label: "Less 1 Hours",
    },
    {
        value: [3600000, 10800000],
        label: "1 to 3 Hours",
    },
    {
        value: [10800000, 21600000],
        label: "3 to 6 Hours",
    },
    {
        value: [21600000, 36000000],
        label: "6 to 10 Hours",
    },
    {
        value: [36000000],
        label: "More than 10 Hours",
    },
];

export const filtersOptions = [
    {
        value: 'level',
        label: 'Level'
    },
    {
        value: 'status',
        label: 'Status'
    },
]

export const courseStatusOptions = [
    {
        value: 'draft',
        label: 'Draft',
        color: 'info',
    },
    {
        value: 'published',
        label: 'Published',
        color: 'success',
    },
    {
        value: 'in-review',
        label: 'In Review',
        color: 'primary',
    },
    {
        value: 'disabled',
        label: 'Disabled',
        color: 'neutral',
    },
    {
        value: 'rejected',
        label: 'Rejected',
        color: 'error',
    },
]

export const levelOptions = [
    {
        value: 'l1',
        index: 1,
        label: 'Beginner',
        color: 'info',
    },
    {
        value: 'l2',
        index: 2,
        label: 'Intermediate',
        color: 'success',
    },
    {
        value: 'l3',
        index: 3,
        label: 'Upper Intermediate',
        color: 'primary',
    },
    {
        value: 'l4',
        index: 4,
        label: 'Advanced',
        color: 'error',
    }
]

export const coursesList = [
    {
        course_id: 1,
        name: "Blockchain Technology and Smart Contracts",
        image: "/images/800x600.png",
        lesson_count: 40,
        duration: 5731143,
        category: "Data Analytics",
        students: 15207,
        level: 'l3',
        price: 16.88,
        rating: 4.3,
        earning: 728304,
        status: 'draft'
    },
    {
        course_id: 2,
        name: "Data Visualization and Dashboard Design",
        image: "/images/800x600.png",
        lesson_count: 25,
        duration: 23346431,
        category: "Data Analytics",
        students: 92665,
        level: 'l4',
        price: 36.79,
        rating: 4.74,
        earning: 893567,
        status: 'draft'
    },
    {
        course_id: 3,
        name: "Distributed Systems and Parallel Computing",
        image: "/images/800x600.png",
        lesson_count: 6,
        duration: 230026490,
        category: "E-commerce",
        students: 80705,
        level: 'l4',
        price: 12.26,
        rating: 4.92,
        earning: 166992,
        status: 'rejected'
    },
    {
        course_id: 4,
        name: "Cryptography and Network Security",
        image: "/images/800x600.png",
        lesson_count: 45,
        duration: 338519781,
        category: "Software Architecture",
        students: 53171,
        level: 'l3',
        price: 80.40,
        rating: 4.18,
        earning: 59472,
        status: 'draft'
    },
    {
        course_id: 5,
        name: "Data Visualization and Dashboard Design",
        image: "/images/800x600.png",
        lesson_count: 22,
        duration: 190581708,
        category: "Data Analytics",
        students: 67795,
        level: 'l4',
        price: 99.98,
        rating: 4.95,
        earning: 286531,
        status: 'rejected'
    },
    {
        course_id: 6,
        name: "Human-Computer Interaction and User Experience Design",
        image: "/images/800x600.png",
        lesson_count: 31,
        duration: 185796021,
        category: "Computer Vision",
        students: 2617,
        level: 'l3',
        price: 47.86,
        rating: 4.35,
        earning: 676206,
        status: 'draft'
    },
    {
        course_id: 7,
        name: "Blockchain Technology and Smart Contracts",
        image: "/images/800x600.png",
        lesson_count: 32,
        duration: 180244445,
        category: "PHP",
        students: 10692,
        level: 'l4',
        price: 17.49,
        rating: 4.54,
        earning: 610243,
        status: 'rejected'
    },
    {
        course_id: 8,
        name: "Social Media and Network Analysis",
        image: "/images/800x600.png",
        lesson_count: 12,
        duration: 222743405,
        category: "Scrum",
        students: 2513,
        level: 'l1',
        price: 28.56,
        rating: 4.75,
        earning: 611922,
        status: 'draft'
    },
    {
        course_id: 9,
        name: "Artificial Neural Networks and Deep Learning",
        image: "/images/800x600.png",
        lesson_count: 21,
        duration: 297772482,
        category: "Artificial Intelligence",
        students: 41959,
        level: 'l1',
        price: 70.81,
        rating: 4.27,
        earning: 675342,
        status: 'published'
    },
    {
        course_id: 10,
        name: "Natural Language Processing and Text Mining",
        image: "/images/800x600.png",
        lesson_count: 41,
        duration: 164221437,
        category: "PHP",
        students: 29000,
        level: 'l2',
        price: 10.00,
        rating: 4.91,
        earning: 336214,
        status: 'draft'
    },
    {
        course_id: 11,
        name: "Virtual Reality and Augmented Reality",
        image: "/images/800x600.png",
        lesson_count: 41,
        duration: 287542441,
        category: "Web Design",
        students: 28706,
        level: 'l4',
        price: 16.71,
        rating: 4.46,
        earning: 227768,
        status: 'draft'
    },
    {
        course_id: 12,
        name: "Cryptography and Network Security",
        image: "/images/800x600.png",
        lesson_count: 24,
        duration: 57993822,
        category: "Data Science",
        students: 24208,
        level: 'l1',
        price: 46.35,
        rating: 4.24,
        earning: 910455,
        status: 'disabled'
    },
    {
        course_id: 13,
        name: "Cryptography and Network Security",
        image: "/images/800x600.png",
        lesson_count: 6,
        duration: 44585220,
        category: "JavaScript",
        students: 34231,
        level: 'l4',
        price: 53.25,
        rating: 4.79,
        earning: 535154,
        status: 'disabled'
    },
    {
        course_id: 14,
        name: "Computer Graphics and Animation",
        image: "/images/800x600.png",
        lesson_count: 22,
        duration: 21624947,
        category: "Neural Networks",
        students: 58075,
        level: 'l4',
        price: 64.00,
        rating: 4.46,
        earning: 341983,
        status: 'rejected'
    },
    {
        course_id: 15,
        name: "Bioinformatics and Computational Biology",
        image: "/images/800x600.png",
        lesson_count: 19,
        duration: 300419664,
        category: "Agile Methodologies",
        students: 31909,
        level: 'l4',
        price: 54.09,
        rating: 4.57,
        earning: 438886,
        status: 'disabled'
    },
    {
        course_id: 16,
        name: "Distributed Systems and Parallel Computing",
        image: "/images/800x600.png",
        lesson_count: 47,
        duration: 260846203,
        category: "Deep Learning",
        students: 69255,
        level: 'l2',
        price: 82.29,
        rating: 4.05,
        earning: 498381,
        status: 'rejected'
    },
    {
        course_id: 17,
        name: "Wireless Networks and Mobile Computing",
        image: "/images/800x600.png",
        lesson_count: 20,
        duration: 59543418,
        category: "Natural Language Processing",
        students: 24023,
        level: 'l2',
        price: 49.96,
        rating: 4.02,
        earning: 876405,
        status: 'published'
    },
    {
        course_id: 18,
        name: "Social Media and Network Analysis",
        image: "/images/800x600.png",
        lesson_count: 42,
        duration: 8752580,
        category: "Ruby on Rails",
        students: 42832,
        level: 'l3',
        price: 32.10,
        rating: 4.05,
        earning: 300486,
        status: 'in-review'
    },
    {
        course_id: 19,
        name: "Embedded Systems and Robotics",
        image: "/images/800x600.png",
        lesson_count: 22,
        duration: 325022706,
        category: "Software Testing",
        students: 86397,
        level: 'l1',
        price: 96.95,
        rating: 4.09,
        earning: 330553,
        status: 'published'
    }
];
