import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { isArray } from 'lodash';
import { ResOp } from '~/helpers/response.helper';

const baseTypeNames = ['String', 'Number', 'Boolean'];

function genBaseProp(type: Type<any>) {
    if (baseTypeNames.includes(type.name)) return { type: type.name.toLocaleLowerCase() };
    else return { $ref: getSchemaPath(type) };
}

export function ApiResult<TModel extends Type<any>>({
    type,
    isPage,
    status,
}: {
    type?: TModel | TModel[];
    isPage?: boolean;
    status?: HttpStatus;
}) {
    let prop = null;

    if (isArray(type)) {
        if (isPage) {
            prop = {
                type: 'object',
                properties: {
                    meta: {
                        type: 'object',
                        properties: {
                            totalCount: { type: 'number', default: 0 },
                            totalPage: { type: 'number', default: 0 },
                            perPage: { type: 'number', default: 0 },
                            currentPage: { type: 'number', default: 0 },
                        },
                    },
                    items: {
                        type: 'array',
                        items: {
                            $ref: getSchemaPath(type[0]),
                        },
                    },
                },
            };
        } else {
            prop = {
                type: 'array',
                items: genBaseProp(type[0]),
            };
        }
    } else if (type) {
        prop = genBaseProp(type);
    } else {
        prop = { type: 'null', default: null };
    }

    const model = isArray(type) ? type[0] : type;

    return applyDecorators(
        ApiExtraModels(model),
        (target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
            queueMicrotask(() => {
                ApiResponse({
                    status: status ?? HttpStatus.OK,
                    description: 'Success',
                    schema: {
                        allOf: [
                            { $ref: getSchemaPath(ResOp) },
                            {
                                properties: {
                                    data: prop,
                                },
                            },
                        ],
                    },
                })(target, key, descriptor);
            });
        },
    );
}
