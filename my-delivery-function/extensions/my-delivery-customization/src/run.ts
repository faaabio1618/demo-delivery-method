import type {
    RunInput,
    FunctionRunResult, FunctionResult, CartDeliveryOption,
} from "../generated/api";

export function run(input: RunInput): FunctionRunResult {
    let isVip = input.cart.buyerIdentity.customer.isVIP;
    const output: FunctionResult = {
        operations: []
    }

    function hideDeliveryOption(handle: string) {
        output.operations.push({
            hide: {
                deliveryOptionHandle: handle
            }
        })
    }

    function cleanFreeLabel(option: CartDeliveryOption) {
        output.operations.push({
            rename: {
                title: option.title.replace("{FREE}", ""),
                deliveryOptionHandle: option.handle
            }
        })
    }

    input.cart.deliveryGroups.forEach((group) => {
        group.deliveryOptions.forEach((option: CartDeliveryOption) => {
            if (option.title.includes('{FREE}')) {
                if (isVip) {
                    cleanFreeLabel(option);
                } else {
                    hideDeliveryOption(option.handle);
                }
            } else if (isVip) {
                hideDeliveryOption(option.handle);
            }
        });
    });
    return output;
}