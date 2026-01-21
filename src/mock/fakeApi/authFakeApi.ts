import { mock } from '../MockAdapter'
import { signInUserData } from '../data/authData'

const TOKEN = 'wVYrxaeNa9OxdnULvde1Au5m5w63'

const sanitizeUser = (user: typeof signInUserData[number]) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user
    return safeUser
}

mock.onPost(`/sign-in`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
    }

    const { email, password: pwd } = data

    const user = signInUserData.find(
        (candidate) => candidate.email === email && candidate.password === pwd,
    )

    if (user) {
        const safeUser = sanitizeUser(user)

        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve([
                    201,
                    {
                        user: safeUser,
                        token: TOKEN,
                    },
                ])
            }, 800)
        })
    }

    return [401, { message: 'Invalid email or password!' }]
})

mock.onPost(`/sign-up`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
        userName: string
    }

    const { email, userName, password } = data

    const emailUsed = signInUserData.some((user) => user.email === email)

    const newUser = {
        userId: (Date.now() + Math.random()).toString(36),
        avatar: '',
        userName,
        email,
        authority: ['client'],
        password,
        accountUserName: userName,
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            if (emailUsed) {
                resolve([400, { message: 'User already exist!' }])
                return
            }

            signInUserData.push(newUser)
            const safeUser = sanitizeUser(newUser)

            resolve([
                201,
                {
                    user: safeUser,
                    token: TOKEN,
                },
            ])
        }, 800)
    })
})

mock.onPost(`/oauth/google`).reply(() => {
    const googleUser = {
        userId: 'google-client-01',
        avatar: '',
        userName: 'Google Client',
        email: 'google-client@ecme.com',
        authority: ['client'],
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([
                201,
                {
                    user: googleUser,
                    token: TOKEN,
                },
            ])
        }, 500)
    })
})

mock.onPost(`/oauth/github`).reply(() => {
    const githubUser = {
        userId: 'github-client-01',
        avatar: '',
        userName: 'Github Client',
        email: 'github-client@ecme.com',
        authority: ['client'],
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([
                201,
                {
                    user: githubUser,
                    token: TOKEN,
                },
            ])
        }, 500)
    })
})

mock.onPost(`/reset-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/forgot-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/sign-out`).reply(() => {
    return [200, true]
})
