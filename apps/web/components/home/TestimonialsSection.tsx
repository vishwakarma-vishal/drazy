import { TestimonialI, testimonials } from "@/data/common";

interface TestimonialCardProps {
    testimonial: TestimonialI;
}

export default function TestimonialsSection() {
    return (
        <section
            className="border-y border-border bg-bg-app py-32"
        >
            <div className="mx-auto max-w-[1024px] px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-16 text-text-main">
                    Feedback from early users
                </h2>

                {/* Testimonial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard key={testimonial.author} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
};

function TestimonialCard({ testimonial }: TestimonialCardProps) {
    return (
        <div id="testimonials"
            className="p-8 rounded-xl border border-border bg-bg-surface relative shadow-sm"
        >
            {/* Quote Icon */}
            <div className="absolute -top-3 -left-3">
                <span className="material-symbols-outlined text-4xl text-primary/20"
                    style={{ fontSize: 32 }}>
                    format_quote
                </span>
            </div>

            {/* 5-Star Rating */}
            <div className="flex gap-1 mb-6 text-primary text-xs">
                {Array(5).fill(0).map((_, index) => (
                    <span key={index} className="material-symbols-outlined text-[18px] fill-current">
                        star
                    </span>
                ))}
            </div>
            <p
                className="text-base text-text-subtle italic mb-8 leading-relaxed"
            >
                "{testimonial.quote}"
            </p>

            <div
                className="flex items-center gap-4 border-t border-border pt-6"
            >
                <div
                    className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500"
                >
                    {testimonial.initials}
                </div>
                <div>
                    <p className="text-sm font-bold text-text-main">
                        {testimonial.author}
                    </p>
                    <p className="text-xs text-text-subtle font-mono">
                        {testimonial.role}
                    </p>
                </div>
            </div>
        </div>
    );
};