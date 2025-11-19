import { Badge } from '@poveroh/ui/components/badge'
import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta<typeof Badge> = {
    title: 'Components/Badge',
    component: Badge,
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
                story: 'Default usage of the Badge component.'
            }
        }
    }
}
