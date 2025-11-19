import type { Meta, StoryObj } from '@storybook/nextjs'
import { Input } from '@poveroh/ui/components/input'
import { Search, Eye } from 'lucide-react'

const meta: Meta<typeof Input> = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        backgrounds: {
            default: 'dark'
        }
    },
    argTypes: {
        placeholder: {
            description: 'Placeholder text for the input',
            control: { type: 'text' }
        },
        startIcon: {
            description: 'Icon component to show on the left side of the input',
            control: false
        },
        endIcon: {
            description: 'Icon component to show on the right side of the input',
            control: false
        },
        disabled: {
            description: 'Disables the input field',
            control: { type: 'boolean' }
        },
        type: {
            description: 'Specifies the input type',
            control: { type: 'text' }
        }
    }
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
    args: {
        placeholder: 'Enter text'
    },
    parameters: {
        docs: {
            description: {
                story: 'Basic input with placeholder.'
            }
        }
    }
}

export const WithStartIcon: Story = {
    args: {
        placeholder: 'Search...',
        startIcon: Search
    }
}

export const WithEndIcon: Story = {
    args: {
        placeholder: 'Show password',
        endIcon: Eye
    }
}

export const WithBothIcons: Story = {
    args: {
        placeholder: 'Search or type...',
        startIcon: Search,
        endIcon: Eye
    }
}

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled input',
        disabled: true
    }
}
