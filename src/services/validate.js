export const Validate = (data) => {
    return Object.keys(data).filter((key) => !data[key]);
};

export const ValidateData = (data) => {
    return Validate(data);
}

export const ValidateCategory = (categ) => {
    const { title, entitle } = categ;
    return ValidateData({ title, entitle });
}

export const hasAttribute = (obj, attributeNamesArr) => {
    return Object.keys(obj).some(key => attributeNamesArr.includes(key));
}

export const attributeNameArr = {
    userUpdate: ['username', 'phoneNumber', 'email', 'birthday', 'bio'],
    address: ['province', 'district', 'village']
}