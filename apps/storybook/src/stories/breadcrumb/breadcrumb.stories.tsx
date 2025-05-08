import { Breadcrumb } from '@poveroh/ui/components/breadcrumb'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Breadcrumb> = {
    title: 'Components/Breadcrumb',
    component: Breadcrumb,
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
                story: 'Default usage of the Breadcrumb component.'
            }
        }
    }
}
