import { Button } from '@poveroh/ui/components/button'
import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button
}

export default meta

type Story = StoryObj<typeof meta>

const storyBackground = {
    parameters: {
        backgrounds: {
            default: 'dark'
        }
    }
}

export const Primary: Story = {
    ...storyBackground,

    args: {
        children: 'Primary',
        size: 'default',
        asChild: false
    },

    argTypes: {
        children: {
            description: 'The content inside the button'
        },
        size: {
            description: 'The size of the button (e.g., small, default, large)'
        },
        asChild: {
            description: 'Determines whether the button behaves as a child component'
        }
    },

    parameters: {
        docs: {
            description: {
                story: 'This is the primary button with default size and background color set to dark.'
            }
        }
    },

    globals: {
        backgrounds: {
            value: 'dark'
        }
    }
}

export const Secondary: Story = {
    ...storyBackground,
    args: {
        children: 'Secondary',
        variant: 'secondary'
    },
    argTypes: {
        children: {
            description: 'The content inside the button'
        },
        size: {
            description: 'The size of the button (e.g., small, default, large)'
        },
        asChild: {
            description: 'Determines whether the button behaves as a child component'
        }
    }
}

export const Outline: Story = {
    ...storyBackground,
    args: {
        children: 'Outline',
        variant: 'outline'
    }
}

export const Disabled: Story = {
    ...storyBackground,
    args: {
        children: 'Disabled',
        disabled: true
    }
}

export const Error: Story = {
    ...storyBackground,
    args: {
        children: 'Error',
        variant: 'danger'
    }
}

export const Success: Story = {
    ...storyBackground,
    args: {
        children: 'Success',
        variant: 'success'
    }
}

export const Warning: Story = {
    ...storyBackground,
    args: {
        children: 'Warning',
        variant: 'warning'
    }
}
