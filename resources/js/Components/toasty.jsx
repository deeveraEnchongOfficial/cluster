import { useEffect } from 'react'
import { toast } from 'sonner'
import { usePage } from '@inertiajs/react'

export default function Toasty() {
    const toastMessages = usePage().props?.__toast_messages || []

    useEffect(() => {
        const toastFns = {
            error: toast.error,
            success: toast.success,
            warning: toast.warning,
            info: toast.info,
        }
        toastMessages.forEach((message) => {
            ;(toastFns[message.type] || toast.message)(message.message)
        })
    }, [toastMessages])
}
