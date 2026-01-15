import { useEffect, useState } from 'react';
import type { CoinProps } from '../../types/coin';
import { useNavigate, useParams } from 'react-router';
import styles from './detail.module.css';

interface ResponseData {
	data: CoinProps;
}

interface ErrorData {
	error: string;
}

type DataProps = ResponseData | ErrorData;

export function Detail() {
	const [coin, setCoin] = useState<CoinProps>();
	const [loading, setLoading] = useState<boolean>(true);
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
			} finally {
				setLoading(false);
			}
		}

		getCoinDetails();
	}, [currency]);

	if (loading || !coin) {
		return (
			<div className={styles.container}>
				<h1 className={styles.center}>Carregando detalhes...</h1>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.center}>{coin?.name}</h1>
			<h1 className={styles.center}>{coin?.symbol}</h1>

			<section className={styles.content}>
				<h1>
					{coin?.name} | {coin?.symbol}
				</h1>
				<img
					src={`https://assets.coincap.io/assets/icons/${coin?.symbol.toLocaleLowerCase()}@2x.png`}
					alt="Logo da moeda"
					className={styles.logo}
				/>
				<p>
					<strong>Preço: </strong>
					{coin?.formattedPrice}
				</p>
				<p>
					<strong>Valor de Mercado: </strong>
					{coin?.formattedMarketCap}
				</p>
				<p>
					<strong>Volume: </strong>
					{coin?.formattedVolume}
				</p>
				<p>
					<strong>Mudança 24h: </strong>
					<span
						className={
							Number(coin?.changePercent24Hr) > 0
								? styles.profit
								: styles.loss
						}
					>
						{`${Number(coin?.changePercent24Hr).toFixed(2)}%`}
					</span>
				</p>
			</section>
		</div>
	);
}
