
export const SendError = (res, status, message, error) => {
    res.status(status).json({ status: false, message, data: {}, error })
}

export const SendSuccess = (res, status, message, data) => {
    res.status(status).json({ status: true, message, data })
}

export const SendS200 = (res, message, data) => {
    res.status(200).json({ status: true, message, data })
}

export const SendS200Post = (res, message, page, countAll, data) => {
    res.status(200).json({ status: true, message, page, countAll, data })
}

export const SendS201 = (res, message, data) => {
    res.status(201).json({ status: true, message, data })
}

export const SendE400 = (res, message, error) => {
    res.status(400).json({ status: false, message, data: [], error })
}

export const SendE401 = (res, message, error) => {
    res.status(401).json({ status: false, message, data: [], error })
}

export const SendE404 = (res, message, error) => {
    res.status(404).json({ status: false, message, data: [], error })
}

export const SendE500 = (res, message, error) => {
    res.status(500).json({ status: false, message, data: [], error })
}
