import React from 'react';

const SearchHistoryBar = ({ history, onSelect }) => {
    {history.length > 0 && (
    <div className="mb-4">
        <h3 className="font-semibold">Lịch sử tìm kiếm gần đây:</h3>
        <ul className="list-disc pl-5 text-gray-700">
            {history.slice(0, 5).map((item, i) => (
                <li
                    key={i}
                    onClick={() => setQ(item.query)}
                    className="cursor-pointer hover:underline"
                >
                    {item.query}
                </li>
            ))}
        </ul>
    </div>
)}
}
export default SearchHistoryBar;
