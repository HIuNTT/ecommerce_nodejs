import { fileURLToPath } from 'url';

export default function getPrismaError(code: string, fieldName: string) {
    if (code === 'P2002') {
        return `[${fieldName}]` + ' ' + 'đã được sử dụng';
    }
    if (code === 'P2003') {
        return `[${fieldName}]` + ' ' + 'không hợp lệ';
    }

    return fieldName;
}
