import { Dialog } from '@poveroh/ui/components/dialog'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Dialog> = {
    title: 'Components/Dialog',
    component: Dialog,
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
                story: 'Default usage of the Dialog component.'
            }
        }
    }
}
