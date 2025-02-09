import { Button } from '@poveroh/ui/components/button'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Button> = {
    title: 'Example/Button',
    component: Button
}

export default meta

type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    args: {
        children: 'Ciao'
    }
}
