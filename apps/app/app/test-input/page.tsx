'use client'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { Input } from '@poveroh/ui/components/input'
import { Label } from '@poveroh/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { RadioGroup, RadioGroupItem } from '@poveroh/ui/components/radio-group'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@poveroh/ui/components/select'
import { Switch } from '@poveroh/ui/components/switch'
import { Textarea } from '@poveroh/ui/components/textarea'
import { cn } from '@poveroh/ui/lib/utils'
import { CalendarIcon, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@poveroh/ui/components/calendar'

export default function TestInputPage() {
    const [date, setDate] = useState<Date>()

    return (
        <>
            <div className='p-10 grid grid-cols-3 gap-4'>
                <div className='flex flex-col space-y-6 w-full'>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm'>Primary</Button>
                        <Button size='md'>Primary</Button>
                        <Button>Primary</Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm'>
                            <Mail /> Login
                        </Button>
                        <Button size='md'>
                            <Mail /> Login
                        </Button>
                        <Button>
                            <Mail /> Login
                        </Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button size='md'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                    </div>

                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' disabled>
                            Primary
                        </Button>
                        <Button size='md' disabled>
                            Primary
                        </Button>
                        <Button disabled>Primary</Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' disabled>
                            <Mail /> Login
                        </Button>
                        <Button size='md' disabled>
                            <Mail /> Login
                        </Button>
                        <Button disabled>
                            <Mail /> Login
                        </Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' disabled>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button size='md' disabled>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button disabled>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                    </div>

                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='danger'>
                            Danger
                        </Button>
                        <Button size='md' variant='danger'>
                            Danger
                        </Button>
                        <Button variant='danger'>Danger</Button>
                    </div>

                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='success'>
                            Success
                        </Button>
                        <Button size='md' variant='success'>
                            Success
                        </Button>
                        <Button variant='success'>Success</Button>
                    </div>

                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='warning'>
                            Warning
                        </Button>
                        <Button size='md' variant='warning'>
                            Warning
                        </Button>
                        <Button variant='warning'>Warning</Button>
                    </div>

                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='secondary'>
                            Secondary
                        </Button>
                        <Button size='md' variant='secondary'>
                            Secondary
                        </Button>
                        <Button variant='secondary'>Secondary</Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='secondary'>
                            <Mail /> Login
                        </Button>
                        <Button size='md' variant='secondary'>
                            <Mail /> Login
                        </Button>
                        <Button variant='secondary'>
                            <Mail /> Login
                        </Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='secondary'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button size='md' variant='secondary'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button variant='secondary'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                    </div>

                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='outline'>
                            Outline
                        </Button>
                        <Button size='md' variant='outline'>
                            Outline
                        </Button>
                        <Button variant='outline'>Outline</Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='outline'>
                            <Mail /> Login
                        </Button>
                        <Button size='md' variant='outline'>
                            <Mail /> Login
                        </Button>
                        <Button variant='outline'>
                            <Mail /> Login
                        </Button>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Button size='sm' variant='outline'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button size='md' variant='outline'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                        <Button variant='outline'>
                            <Loader2 className='animate-spin' />
                            Loading
                        </Button>
                    </div>
                </div>
                <div className='flex flex-col space-y-6 w-full'>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Input placeholder='Placeholder'></Input>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='terms' />
                        <label
                            htmlFor='terms'
                            className='font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                            Accept terms and conditions
                        </label>
                    </div>
                    <div className='flex flex-row space-x-6 w-full'>
                        <Input placeholder='ciao'></Input>
                    </div>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder='Select a fruit' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value='apple'>Apple</SelectItem>
                                <SelectItem value='banana'>Banana</SelectItem>
                                <SelectItem value='blueberry'>Blueberry</SelectItem>
                                <SelectItem value='grapes'>Grapes</SelectItem>
                                <SelectItem value='pineapple'>Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className='flex items-center space-x-2'>
                        <Switch id='airplane-mode' />
                        <Label htmlFor='airplane-mode'>Airplane Mode</Label>
                    </div>
                    <RadioGroup defaultValue='comfortable'>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='default' id='r1' />
                            <Label htmlFor='r1'>Default</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='comfortable' id='r2' />
                            <Label htmlFor='r2'>Comfortable</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='compact' id='r3' />
                            <Label htmlFor='r3'>Compact</Label>
                        </div>
                    </RadioGroup>
                    <Textarea placeholder='Type your message here.' />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'secondary'}
                                className={cn(
                                    'justify-start text-left font-normal',
                                    !date && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon />
                                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                            <Calendar
                                mode='single'
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </>
    )
}
