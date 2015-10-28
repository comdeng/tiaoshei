<?php
class ActionController extends PageController
{
	const BTCCHINA_URL = 'https://data.btcchina.com/data/ticker';
	const OKCOIN_URL = 'https://www.okcoin.com/ticker.do';
	public function btcchina()
	{
		$cache = Com::get('cache');
		$cacheKey = 'api.bytecoin.btcchina';
		$data = $cache->get($cacheKey);
		if ($data === null) {
			$curl = LibUtil::load('Curl');
			$body = $curl->get(self::BTCCHINA_URL);
			
			$body = json_decode($body['content'], true);
			if (!empty($body['ticker'])) {
				$data = $body['ticker'];
				$cache->set($cacheKey, $data, 10);
			}
		}
		$this->request->of = 'json';
		$this->set('ticker', $data);
	}

	public function okcoin()
	{
		$cache = Com::get('cache');
		$cacheKey = 'api.bytecoin.okcoin';
		$data = $cache->get($cacheKey);
		if ($data === null) {
			$curl = LibUtil::load('Curl');
			$body = $curl->post(self::OKCOIN_URL, array('random' => rand(10, 99)));
			
			$data = json_decode($body['content'], true);
			$data['last'] = $data['btcLast'];
			foreach(array('btcLast', 'btcVolume', 'ltcLast', 'ltcVolume') as $key) {
				unset($data[$key]);
			}
			$cache->set($cacheKey, $data, 10);
		}
		$this->request->of = 'json';
		$this->set('ticker', $data);
	}

	public function _after()
	{
		$this->set('_time', time());
	}
}
