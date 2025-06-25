import { useState } from 'react';

const useSignUpForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.email) {
            setError('Email Address is required');
        } else {
            setError('');
            // Call API here or console.log
            console.log('Form Submitted:', formData);
        }
    };

    return {
        formData,
        error,
        handleChange,
        handleSubmit,
    };
};

export default useSignUpForm;
