import React, { useState } from 'react';
import PhysicalInfoForm from '../components/physicalInfoForm';
import PhysicalInfoHistory from '../components/PhysicalInfoHistory';
import { generateHealthAssessment } from '../components/healthAssessment';
import { FaHeartbeat, FaHistory } from 'react-icons/fa';

const PhysicalInfoPage = () => {
    const [assessment, setAssessment] = useState('');

    const handleAssessment = (data) => {
        const fullAssessment = generateHealthAssessment(data);
        setAssessment(fullAssessment);
    };

    return (
        <div className="container py-5" style={{ maxWidth: 1000 }}>
            {/* Page Title */}
            <h2 className="text-center fw-bold mb-4" style={{ color: 'black' }}>
                Track Physical Information
            </h2>

            <div className="row g-4">
                {/* Left: Update Form Section */}
                <div className="col-lg-7">
                    <div className="card shadow-lg border-0 h-100 rounded-4">
                        <div
                            className="card-header text-white d-flex align-items-center rounded-top-4"
                            style={{
                                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                            }}
                        >
                            <FaHeartbeat className="me-2" />
                            <div>
                                <h5 className="mb-0 fw-bold text-uppercase">Update Physical Information</h5>
                                <small>Fill in the basic details to monitor your health.</small>
                            </div>
                        </div>

                        <div className="card-body bg-light">
                            <PhysicalInfoForm onAssess={handleAssessment} />
                            {assessment && (
                                <div className="mt-4 p-3 border rounded bg-white">
                                    <h5 className="text-success mb-2">Health Assessment</h5>
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>{assessment}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: History Section */}
                <div className="col-lg-5">
                    <div className="card shadow-lg border-0 h-100 rounded-4">
                        <div
                            className="card-header text-white d-flex align-items-center rounded-top-4"
                            style={{
                                background: 'linear-gradient(90deg, #6c757d 0%, #343a40 100%)',
                            }}
                        >
                            <FaHistory className="me-2" />
                            <div>
                                <h5 className="mb-0 fw-bold text-uppercase">Change History</h5>
                                <small>Review your past physical updates.</small>
                            </div>
                        </div>

                        <div
                            className="card-body bg-light overflow-auto"
                            style={{ maxHeight: '600px', minHeight: '400px' }}
                        >
                            <PhysicalInfoHistory />
                        </div>
                    </div>
                </div>
            </div>

            {/* Extra responsive tweak */}
            <style>{`
        @media (max-width: 576px) {
          pre {
            font-size: 0.9rem;
          }
        }
      `}</style>
        </div>
    );
};

export default PhysicalInfoPage;