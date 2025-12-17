export interface FeatureI {
    icon: string;
    title: string;
    description: string;
}

export interface CapabilityI {
    icon: string;
    title: string;
    description: string;
}

export interface TestimonialI {
    quote: string;
    author: string;
    role: string;
    initials: string;
}

export interface RoadmapItemI {
    quarter: string;
    title: string;
    description: string;
    status: 'completed' | 'upcoming';
}

export const features: FeatureI[] = [
    {
        icon: 'speed',
        title: 'High-Performance Canvas',
        description:
            'Built for smooth interactions and real-time updates, even as diagrams grow in complexity.',
    },
    {
        icon: 'api',
        title: 'Structured Canvas Data',
        description:
            'Every element on the canvas is modeled clearly, enabling precise editing and consistent collaboration.',
    },
    {
        icon: 'contrast',
        title: 'Cognitive Clarity',
        description:
            'High contrast, clean themes designed to reduce eye strain and keep focus on your diagrams.',
    },
];

export const capabilities: CapabilityI[] = [
    {
        icon: 'draw',
        title: 'Custom Canvas Engine',
        description:
            'A fully custom-built canvas engine where rendering, mouse input, and keyboard interactions are handled in-house for precise control over every shape.',
    },
    {
        icon: 'sync_saved_locally',
        title: 'Real-Time Sync & Batching',
        description:
            'Canvas edits are captured instantly and batched efficiently before syncing over the network, keeping collaboration smooth and responsive.',
    },
    {
        icon: 'save',
        title: 'Structured Shape Model',
        description:
            'Each shape is implemented as an independent entity with its own properties, enabling predictable updates, transforms, and collaboration behavior.',
    },
    {
        icon: 'splitscreen',
        title: 'Multi-User Collaboration',
        description:
            'Multiple users can work on the same canvas simultaneously, with all interactions reflected live across sessions without manual refresh.',
    },
];

export const testimonials: TestimonialI[] = [
    {
        quote:
            'Finally, a whiteboard that feels built for developers. No distractions, just the tools I need to think clearly.',
        author: 'Early User',
        role: 'Software Engineer',
        initials: 'EU',
    },
    {
        quote:
            'Real-time collaboration feels smooth even as diagrams grow. It stays responsive while we work together.',
        author: 'Beta Tester',
        role: 'Full-Stack Developer',
        initials: 'BT',
    },
    {
        quote:
            'Clean UI, sensible shortcuts, and a canvas that doesn’t get in the way. It feels intentional.',
        author: 'Community Member',
        role: 'Backend Engineer',
        initials: 'CM',
    },
];

export const roadmap: RoadmapItemI[] = [
    {
        quarter: 'Now',
        title: 'Real-Time Multi-Room Collaboration',
        description:
            'Create multiple rooms and collaborate with multiple users in real time, with all canvas changes synced instantly.',
        status: 'completed',
    },
    {
        quarter: 'Next',
        title: 'Collaboration Conflict Handling',
        description:
            'Improved handling for simultaneous edits, deletions, and shape updates to ensure consistent behavior during concurrent actions.',
        status: 'upcoming',
    },
    {
        quarter: 'Later',
        title: 'Advanced Collaboration Controls',
        description:
            'Smarter editing rules, ownership models, and collaboration refinements to make real-time teamwork more predictable.',
        status: 'upcoming',
    },
];

export const footerLinks = {
    Product: [
        { label: 'Canvas', url: "#hero", status: 'live' },
        { label: 'Collaboration', url: "#", status: 'soon' },
        { label: 'Roadmap', url: "#roadmap", status: 'live' },
    ],
    Resources: [
        { label: 'Documentation', url: "#", status: 'soon' },
        { label: 'Guides', url: "#", status: 'soon' },
        { label: 'Releases', url: "#", status: 'soon' },
    ],
    Company: [
        { label: 'Features', url: "#features", status: 'live' },
        { label: 'Build in Public', url: "#", status: 'soon' },
        { label: 'Contact', url: "#", status: 'soon' },
    ],
};