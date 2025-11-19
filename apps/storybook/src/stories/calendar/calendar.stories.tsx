import { Calendar } from '@poveroh/ui/components/calendar'
import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta<typeof Calendar> = {
    title: 'Components/Calendar',
    component: Calendar,
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
                story: 'Default usage of the Calendar component.'
            }
        }
    }
}
