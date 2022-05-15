# Dig and whois command

- Bài này để remind mình tìm hiểu thêm về lệnh `dig` và `whois`. Hôm bữa gặp sự cố 1 bạn AWS supporter dùng 2 lệnh này để trace ra issue nên thấy 2 lệnh này hữu ích nên tìm hiểu thêm


- Dig example: 
```
$ dig weomni.com +trace +nodnssec

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.amzn2.5.2 <<>> weomni.com +trace +nodnssec
;; global options: +cmd
.                       518400  IN      NS      H.ROOT-SERVERS.NET.
.                       518400  IN      NS      I.ROOT-SERVERS.NET.
.                       518400  IN      NS      J.ROOT-SERVERS.NET.
.                       518400  IN      NS      K.ROOT-SERVERS.NET.
.                       518400  IN      NS      L.ROOT-SERVERS.NET.
.                       518400  IN      NS      M.ROOT-SERVERS.NET.
.                       518400  IN      NS      A.ROOT-SERVERS.NET.
.                       518400  IN      NS      B.ROOT-SERVERS.NET.
.                       518400  IN      NS      C.ROOT-SERVERS.NET.
.                       518400  IN      NS      D.ROOT-SERVERS.NET.
.                       518400  IN      NS      E.ROOT-SERVERS.NET.
.                       518400  IN      NS      F.ROOT-SERVERS.NET.
.                       518400  IN      NS      G.ROOT-SERVERS.NET.
;; Received 239 bytes from 172.31.0.2#53(172.31.0.2) in 0 ms

com.                    172800  IN      NS      a.gtld-servers.net.
com.                    172800  IN      NS      b.gtld-servers.net.
com.                    172800  IN      NS      c.gtld-servers.net.
com.                    172800  IN      NS      d.gtld-servers.net.
com.                    172800  IN      NS      e.gtld-servers.net.
com.                    172800  IN      NS      f.gtld-servers.net.
com.                    172800  IN      NS      g.gtld-servers.net.
com.                    172800  IN      NS      h.gtld-servers.net.
com.                    172800  IN      NS      i.gtld-servers.net.
com.                    172800  IN      NS      j.gtld-servers.net.
com.                    172800  IN      NS      k.gtld-servers.net.
com.                    172800  IN      NS      l.gtld-servers.net.
com.                    172800  IN      NS      m.gtld-servers.net.
;; Received 835 bytes from 2001:500:2d::d#53(D.ROOT-SERVERS.NET) in 1 ms

weomni.com.             172800  IN      NS      ns1.redmonddc.com.
weomni.com.             172800  IN      NS      ns2.redmonddc.com.
;; Received 117 bytes from 192.54.112.30#53(h.gtld-servers.net) in 225 ms

;; Received 39 bytes from 134.119.176.18#53(ns2.redmonddc.com) in 302 ms

        This showed that the Name Servers responsible for the domain is showing as ns1.redmonddc.com and ns2.redmonddc.com. These were also showing up when checking the WHOIS record for this domain.
```

- Whois example:

```
$ whois weomni.com | grep Server
   Registrar WHOIS Server: whois.onlinenic.com
   Name Server: NS1.REDMONDDC.COM
   Name Server: NS2.REDMONDDC.COM

        This confirmed that there was an edit made at your DNS Hosting provider “Online NIC, INC” yesterday at “2022-03-17T23:06:22Z” which changed the Name Serves from AWS to the above 2. This caused the DNS resolution to fail.

Solution for this issue will be to correct the Name Server records at your DNS Hosting provider to point them back at the 4 name servers of AWS [1]. Correct Name Servers to be used are given below:

ns-1139.awsdns-14.org
ns-1787.awsdns-31.co.uk
ns-200.awsdns-25.com
ns-1003.awsdns-61.net

        Once this change is updated, DNS resolvers around the world will start to resolve the domain correctly. Do note that if the wrong records were cached by some DNS resolvers already, they may still communicate to the wrong name servers until the DNS TTL (cache) expires. This could take about 48 hours to complete as the TTL set at your hosting provider for Name Servers is 172800 (i.e 48 hours). During this time, you will start to notice that the DNS resolution is working for some clients while failing for others. Since this is the way DNS is designed to work, there is no way for us to force clear the cache. Waiting for it to clear automatically is the best way left.

        I will also recommend to put in strict change control policies to avoid such unexpected issues in the future. Changing the Name Server entries to wrong ones will affect the whole domain including email delivery and will take longer time to recover.

        Reference:
                [1] OnlineNIC edit Name Servers - https://www.onlinenic.com/faq/detail.php?id=34&f_id=69
```