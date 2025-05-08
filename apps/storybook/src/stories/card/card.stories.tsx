import { Card } from '@poveroh/ui/components/card'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Card> = {
    title: 'Components/Card',
    component: Card,
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
                story: 'Default usage of the Card component.'
            }
        }
    }
}
