import React from 'react';

interface AnnouncementsLayoutProps {
    children: React.ReactNode;
}

const AnnouncementsLayout: React.FC<AnnouncementsLayoutProps> = ({ children }) => {
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4 p-4'>Announcements Dashboard</h1>
            <section>
                {children}
            </section>
        </div>
    );
};

export default AnnouncementsLayout;