type AppConfigType = {
    name: string,
    github: {
        title: string,
        url: string
    },
    author: {
        name: string,
        url: string
    },
}

export const appConfig: AppConfigType = {
    name: import.meta.env.VITE_APP_NAME ?? "Sample App",
    github: {
        title: "wedding-planner-ai",
        url: "https://github.com/LauraRoson99/wedding-planner-ai",
    },
    author: {
        name: "Laura",
        url: "https://github.com/LauraRoson99/",
    }
}

export const baseUrl = import.meta.env.VITE_BASE_URL ?? ""