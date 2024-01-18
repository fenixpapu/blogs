# Vagrant custom ubuntu

- Trong bài [này](../2023/0222-custom-ubuntu-image-with-ready-ssh-service.md) mình có custom một docker image để khi docker run là ta có một container sẵn sàng ssh được từ máy chủ (máy chạy docker). Tuy nhiên trong quá trình giả lập để test một số dịch vụ khi chạy ansible, có vẻ container ko đáp ứng được nên mình đã phải dùng `vagrant`. 

- TLDR: bài này setup để khi vagrant chạy `ubuntu` sẽ add sẵn luôn ssh key cho account `vagrant` và account `root`.

- Cài đặt vagrant link official [tại đây](https://developer.hashicorp.com/vagrant/downloads). Note vagrant dùng quản lý chạy các VM nên sẽ khác và tốn tài nguyên hơn docker.

## Cài đặt

- Ở đây mình dùng VM là [virtualbox](https://www.virtualbox.org/wiki/Linux_Downloads).

- Cài đặt plugin cho vagrant:

```
vagrant plugin install vagrant-hosts
```

- Tạo folder `vagrant-ubuntu-custom-ssh-key`.
- `cd` vào thư mục vừa tạo `vagrant-ubuntu-custom-ssh-key`. 
- Chạy init vagrant, ở đây chúng ta sẽ chạy `ubuntu/focal64`:

```
vagrant init ubuntu/focal64
```

- Thêm các tham số cho machine.

```terminal
BOX_NAME =  ENV['BOX_NAME'] || "ubuntu/focal64"
BOX_MEM = ENV['BOX_MEM'] || "1024"
BOX_CPUS = ENV['BOX_CPUS'] || "2"
CLUSTER_HOSTS = ENV['CLUSTER_HOSTS'] || "vagrant_hosts"
```

- Một vagrant file có thể định nghĩa cho nhiều machine và setup sẵn các cấu hình cho từng machine. Như dưới mình sẽ add thêm 1 machine. Ghi đè file host và add sẵn public key cho user `vagrant` và `root` mục đích để khi machine up là từ host mình có thể ssh vào luôn không cần phải đi add thủ công lại.

```terminal
config.vm.define "node1", primary: true do |node1_config|
    node1_config.vm.box = "ubuntu/focal64"
    node1_config.vm.hostname = "node1"
    node1_config.ssh.shell = "/bin/sh"
    node1_config.ssh.forward_agent = true
    node1_config.vm.network :private_network, ip: "192.168.56.235"
    #node1_config.vm.network "forwarded_port", guest: 22, host: 2252
    node1_config.vm.boot_timeout = 360
    node1_config.vm.provider "virtualbox" do |vb|
      vb.name = "node1"
      vb.memory = BOX_MEM
      vb.cpus = BOX_CPUS
      vb.customize ["modifyvm", :id, "--uartmode1", "file", File::NULL] # https://bugs.launchpad.net/cloud-images/+bug/1874453
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    end
    node1_config.vm.provision :hosts do |provisioner|
      provisioner.sync_hosts = false
      provisioner.add_localhost_hostnames = false
      provisioner.add_host '192.168.56.235', ['node1']
      provisioner.add_host '192.168.56.236', ['node2']
      provisioner.add_host '192.168.56.237', ['node3']
      #provisioner.add_host '192.168.122.27', ['dc2p-mssql-master.citigo.io']
    end
    config.vm.provision "shell" do |s|
        ssh_pub_key = File.readlines("#{Dir.home}/.ssh/id_rsa.pub").first.strip
        s.inline = <<-SHELL
          echo #{ssh_pub_key} >> /home/vagrant/.ssh/authorized_keys
          echo #{ssh_pub_key} >> /root/.ssh/authorized_keys
        SHELL
    end
```
- Chỉ vậy thôi đến đây chỉ cần `vagrant up` và chờ là từ máy chủ có thể ssh vào được máy vừa tạo.

- Note:
  - File đầy đủ cho bài này ở [đây](https://github.com/fenixpapu/blog-vagrant-custom-ubuntu-ssh-key)

  - Nếu bạn dùng vagrant nhiều nên đọc qua doc [tại đây](https://developer.hashicorp.com/vagrant/tutorials/getting-started/getting-started-index#getting-started-index) nó khá hữu ích,  như các thuật ngữ chung khi chúng ta dùng vagrant: `machine` là gì , `box` là gì. Root password là gì? (`vagrant` nhé :v ). Hay cách để connect từ box ra ngoài máy localhost như thế nào?



- Vậy thôi bài này mục đích note lại phần setup ssh key cho box trên vagrant :D.

- Happy devops! :D




