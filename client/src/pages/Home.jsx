import React from 'react';
import { Link } from 'react-router-dom';

const features = [
    {
        title: 'Food Search',
        desc: 'Search for nutritional information of foods.',
        img: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
        link: '/food',
        color: 'from-green-200 to-green-100'
    },
    {
        title: 'Physical',
        desc: 'View your physical information and assessments.',
        img: 'https://cdn-icons-png.flaticon.com/512/2907/2907592.png',
        link: '/physical-info',
        color: 'from-blue-200 to-blue-100'
    },
    {
        title: 'Profile',
        desc: 'Manage your personal information and health goals.',
        img: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
        link: '/profile',
        color: 'from-yellow-200 to-yellow-100'
    },
    {
        title: 'Suggestion',
        desc: 'Get healthier suggestions based on your data.',
        img: 'https://cdn-icons-png.flaticon.com/512/1046/1046759.png',
        link: '/healthier-suggestions',
        color: 'from-purple-200 to-purple-100'
    }
];

const Home = () => {
    return (
        <div className="min-h-screen bg-[#fdfaf4] py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-center">
                    Welcome to Nutrition App!
                </h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    Manage your diet, track nutrition, and improve your health every day.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl shadow-md bg-gradient-to-br ${f.color} p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-xl`}
                        >
                            <img src={f.img} alt={f.title} className="w-16 h-16 mb-4" />
                            <h2 className="text-xl font-bold mb-2 text-gray-800 text-center">{f.title}</h2>
                            <p className="text-gray-600 mb-4 text-center text-sm">{f.desc}</p>
                            <Link
                                to={f.link}
                                className="mt-auto px-4 py-2 bg-emerald-500 text-white rounded-full font-semibold shadow hover:bg-emerald-600 transition"
                            >
                                Go to {f.title}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
