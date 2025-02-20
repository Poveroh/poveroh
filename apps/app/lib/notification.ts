// import { NotifcationStatus } from '@poveroh/types'
// import { Notyf } from 'notyf'

// import 'notyf/notyf.min.css';

// const notyf = new Notyf({
//     duration: 20000,
//     ripple: true,
//     position: {
//         x: 'center',
//         y: 'bottom'
//     },
//     types: [
//         {
//             type: 'success',
//             background: '#198754',
//             duration: 5000,
//             dismissible: true
//         },
//         {
//             type: 'error',
//             background: '#D92626',
//             duration: 20000,
//             dismissible: false
//         },
//         {
//             type: 'warning',
//             background: '#f89406',
//             duration: 20000,
//             dismissible: true
//         },
//         {
//             type: 'info',
//             background: '#f89406',
//             duration: 20000,
//             dismissible: true
//         },
//         {
//             type: 'custom',
//             background: '#483B44',
//             duration: 0,
//             dismissible: false
//         }
//     ]
// })

// const dismissAll = () => {
//     notyf.dismissAll()
// }

// const openNotification = (type: NotifcationStatus, message: string) => {
//     switch (type) {
//         case 'error':
//             notyf.error(message)
//             break
//         case 'success':
//             notyf.success(message)
//             break
//         case 'warning':
//             notyf.open({ type: 'warning', message: message })
//             break
//         case 'info':
//             notyf.open({ type: 'info', message: message })
//             break
//     }
// }

// export { notyf, dismissAll, openNotification }
