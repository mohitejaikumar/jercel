import React from 'react';


function TerminalCard({ terminalContent }) {

    return (
        <div className="bg-black rounded-lg shadow-lg p-6  w-[600px] h-full">
            <div className="flex  mb-2">
                <div className="h-3 w-3 mx-1 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 mx-1 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 mx-1 rounded-full bg-green-500"></div>
            </div>
            <div className="h-96 bg-gray-900 text-green-300 p-4 rounded-lg overflow-y-auto shadow-md">
                {terminalContent.map((line, index) => (
                    <p key={index} className="mb-1">$ {line}</p>
                ))}
            </div>
            
        </div>
    );
}

export default TerminalCard;
