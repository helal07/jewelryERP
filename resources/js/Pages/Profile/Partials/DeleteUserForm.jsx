import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useLanguage();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and access</p>
                </div>

                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h3 className="text-base font-bold text-gray-900">
                        Confirm Account Deletion
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Please enter your password to permanently delete your account.
                    </p>

                    <div className="mt-4">
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-rose-500 focus:border-rose-500"
                            placeholder="Current Password"
                            required
                        />
                        {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            Delete Account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
