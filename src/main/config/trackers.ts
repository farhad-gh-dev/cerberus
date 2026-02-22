/**
 * Shared announce tracker list used for both magnet link construction and
 * peer discovery when adding torrents.
 *
 * HTTP/HTTPS/WSS trackers work even when ISPs block UDP tracker traffic.
 */
export const ANNOUNCE_TRACKERS = [
  // --- HTTP / HTTPS trackers (TCP-based, harder for ISPs to block) ---
  'http://tracker.opentrackr.org:1337/announce',
  'https://tracker.tamersunion.org:443/announce',
  'https://tracker.gbitt.info:443/announce',
  'http://tracker.gbitt.info:80/announce',
  'https://tracker.loligirl.cn:443/announce',
  'http://tracker.mywaifu.best:6969/announce',
  'https://tracker.lilithraws.org:443/announce',
  'http://tracker1.bt.moack.co.kr:80/announce',
  'http://tracker.files.fm:6969/announce',
  'http://tracker.bt4g.com:2095/announce',
  'http://p4p.arenabg.com:1337/announce',
  'https://tracker.renfei.net:443/announce',
  'http://bittorrent-tracker.e-n-c-r-y-p-t.net:1337/announce',
  'http://tracker2.dler.org:80/announce',
  'https://tr.burnabyhighstar.com:443/announce',

  // --- WebSocket trackers (use HTTPS port, very hard to block) ---
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.fastcast.nz',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.files.fm:7073/announce',

  // --- UDP trackers (original, may be blocked by some ISPs) ---
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.openbittorrent.com:80',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://p4p.arenabg.com:1337',
  'udp://tracker.coppersurfer.tk:6969',
  'udp://tracker.leechers-paradise.org:6969',
  'udp://explodie.org:6969/announce',
  'udp://open.stealth.si:80/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'udp://tracker.moeking.me:6969/announce',
  'udp://movies.zsw.ca:6969/announce',
  'udp://retracker.lanta-net.ru:2710/announce',
  'udp://open.tracker.cl:1337/announce'
]
