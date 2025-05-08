import { Alert } from '@poveroh/ui/components/alert'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Alert> = {
    title: 'Components/Alert',
    component: Alert,
    parameters: {
        backgrounds: {
            default: 'dark'
        }
    }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Default usage of the Alert component.'
            }
        }
    }
}
