import { AlertDialog } from '@poveroh/ui/components/alert-dialog'
import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta<typeof AlertDialog> = {
    title: 'Components/AlertDialog',
    component: AlertDialog,
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
                story: 'Default usage of the AlertDialog component.'
            }
        }
    }
}
