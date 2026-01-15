import { useEffect, useState } from 'react';
import type { CoinProps } from '../../types/coin';
import { Navigate, useNavigate, useParams } from 'react-router';

interface ResponseData {
	data: CoinProps;
}

interface ErrorData {
	error: string;
}

type DataProps = ResponseData | ErrorData;

export function Detail() {
	const [coin, setCoin] = useState<CoinProps>();
	const { currency } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		async function getCoinDetails() {
			try {
				const API_URL = import.meta.env.VITE_COINCAP_API_URL;
				const API_KEY = import.meta.env.VITE_COINCAP_API_KEY;

				const response = await fetch(`${API_URL}/assets/${currency}`, {
					headers: {
						authorization: `Bearer ${API_KEY}`,
					},
				});

				if (!response.ok) {
					throw new Error('Erro ao obter detalhes da moeda');
				}

				const data: DataProps = await response.json();

				if ('error' in data) {
					navigate('/');
					return;
				}

				const price = Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
				});

				const compactedPrice = Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					notation: 'compact',
				});

				const coinData = data.data;
				const coinDetails = {
					...coinData,
					formattedPrice: price.format(Number(coinData.priceUsd)),
					formattedMarketCap: compactedPrice.format(
						Number(coinData.marketCapUsd)
					),
					formattedVolume: compactedPrice.format(
						Number(coinData.volumeUsd24Hr)
					),
				};

				setCoin(coinDetails);
			} catch (error) {
				if (error instanceof Error) {
					console.log(error.message);
					navigate('/');
				}
			}
		}

		getCoinDetails();
	}, [currency]);

	return (
		<div>
			<h1>Detalhes da moeda {currency}</h1>
		</div>
	);
}
