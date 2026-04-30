import React from 'react'
import { OrderDetailScreen } from './OrderDetailScreen'

export const SalesOrderDetailScreen: React.FC<any> = ({ route, navigation }) => {
	const mergedRoute = {
		...route,
		params: {
			...(route?.params || {}),
			orderType: 'sales',
		},
	}

	return <OrderDetailScreen route={mergedRoute} navigation={navigation} />
}
