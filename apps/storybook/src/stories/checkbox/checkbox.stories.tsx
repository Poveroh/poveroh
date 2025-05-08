import { Checkbox } from '@poveroh/ui/components/checkbox'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Checkbox> = {
    title: 'Components/Checkbox',
    component: Checkbox,
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
                story: 'Default usage of the Checkbox component.'
            }
        }
    }
}
