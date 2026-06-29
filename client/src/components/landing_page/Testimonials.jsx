import React from 'react'

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'Software Engineer at Google',
        batch: 'Batch of 2021',
        avatar: 'PS',
        avatarColor: '#004AC6',
        quote: "AlumniConnect completely changed my job search. I got connected with a senior engineer at Google who referred me internally. Within 6 weeks, I had an offer letter. This platform is a game changer for students!",
        rating: 5,
    },
    {
        name: 'Rahul Mehta',
        role: 'Product Manager at Flipkart',
        batch: 'Batch of 2020',
        avatar: 'RM',
        avatarColor: '#059669',
        quote: "The mentorship I received through AlumniConnect was invaluable. My mentor helped me transition from engineering to product management with weekly sessions and resume reviews. I couldn't have done it without this community.",
        rating: 5,
    },
    {
        name: 'Aanya Patel',
        role: 'Data Scientist at Microsoft',
        batch: 'Batch of 2022',
        avatar: 'AP',
        avatarColor: '#7C3AED',
        quote: "I attended an AlumniConnect virtual event and ended up networking with 15+ professionals in my field. Three of them became long-term mentors. The alumni here genuinely want to help you succeed.",
        rating: 5,
    },
]

const StarRating = ({ count }) => (
    <div className="flex gap-1">
        {Array.from({ length: count }).map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
)

const TestimonialCard = ({ testimonial }) => (
    <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5">
        <StarRating count={testimonial.rating} />
        <p className="text-gray-600 text-sm leading-relaxed italic">"{testimonial.quote}"</p>
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
            <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: testimonial.avatarColor }}
            >
                {testimonial.avatar}
            </div>
            <div>
                <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                <div className="text-gray-400 text-xs">{testimonial.role}</div>
                <div className="text-gray-400 text-xs">{testimonial.batch}</div>
            </div>
        </div>
    </div>
)

const Testimonials = () => {
    return (
        <section id="success" className="py-16 lg:py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-10 lg:mb-14">
                    <span className="text-xs font-bold tracking-widest text-[#004AC6] uppercase bg-blue-50 px-4 py-1.5 rounded-full">
                        Success Stories
                    </span>
                    <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-gray-900">What Our Alumni Say</h2>
                    <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm lg:text-base">
                        Thousands of students and alumni have transformed their careers through AlumniConnect. Here are some of their stories.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <TestimonialCard key={t.name} testimonial={t} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
