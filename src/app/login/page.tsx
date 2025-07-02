'use client';

import { login, signup } from '@/app/login/actions';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <form className=" p-8 rounded shadow-md space-y-4 w-80 border-2 border-gray-200">
                <h2 className="text-2xl font-semibold text-center">Welcome</h2>

                <div className="flex flex-col">
                    <label htmlFor="email" className="mb-1 text-sm font-medium">Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="password" className="mb-1 text-sm font-medium">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    />
                </div>

                <div className="flex justify-between gap-4 pt-4">
                    <button
                        formAction={login}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-1/2"
                    >
                        Log in
                    </button>
                    <button
                        formAction={signup}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-1/2"
                    >
                        Sign up
                    </button>
                </div>
            </form>
        </div>
    );
}
