import {Product as ProductType} from '@/types/product';

export const capitaliseString = (str: string): string => {
    const capitaliseFirstLetter = (s: string) => {
        if (s && s[0]) {
            return s[0].toUpperCase() + s.substring(1);
        }

        return s;
    };

    let output = capitaliseFirstLetter(str.toLowerCase());

    const delimiters = [' ', '/', '-'];
    const excludedWords = ['the', 'a', 'and', 'with'];

    delimiters.forEach(d => {
        output = output
            .split(d)
            .map((o, i) => {
                if (i === 0) {
                    return o;
                }

                if (excludedWords.includes(o.toLowerCase())) {
                    return o.toLowerCase();
                }

                return capitaliseFirstLetter(o);
            })
            .join(d);
    });

    return output;
};

export const stringifyColors = (colors: string[]): string => {
    return colors
        .map(color => {
            return capitaliseString(color);
        })
        .join(', ');
};

export const alreadyExists = (id: string, array: ProductType[]): boolean => {
    array.forEach(product => {
        if (id === product._id) {
            return true;
        }
    });

    return false;
};
