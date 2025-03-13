import { ModalUrl } from '@/components/modal'

type Props = {
    params: {
        id: string
    }
}

export default async function BankAccountModal({ params: { id } }: Props) {
    console.log(id)

    return (
        <ModalUrl>
            <div>ciaociao</div>
        </ModalUrl>
    )
}
