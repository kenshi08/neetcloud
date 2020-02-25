provider "openstack" {
  user_name   = "username"
  tenant_name = "scb-01"
  password    = "password"
  auth_url    = "https://viofqdn:5000/v2"
  domain_name = "Default"
  insecure = "true"
}

resource "openstack_networking_network_v2" "scb-terraform-net" {
  name           = "scb-terraform-net"
  admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "scb-terraform-subnet" {
  name            = "scb-terraform-subnet"
  network_id      = "${openstack_networking_network_v2.scb-terraform-net.id}"
  cidr            = "10.0.0.0/24"
  ip_version      = 4
  dns_nameservers = ["8.8.8.8", "8.8.4.4"]
}

resource "openstack_networking_router_v2" "scb-terraform-router" {
  name             = "scb-terraform-router"
  admin_state_up   = "true"
  external_network_id = "${var.external_gateway}"
}

resource "openstack_networking_router_interface_v2" "scb-terraform-interface" {
  router_id = "${openstack_networking_router_v2.scb-terraform-router.id}"
  subnet_id = "${openstack_networking_subnet_v2.scb-terraform-subnet.id}"
}

resource "openstack_compute_secgroup_v2" "scb-terraform-sec" {
  name        = "scb-terraform-sec"
  description = "Security group for the SCB Terraform instances"

  rule {
    from_port   = 22
    to_port     = 22
    ip_protocol = "tcp"
    cidr        = "0.0.0.0/0"
  }

  rule {
    from_port   = 80
    to_port     = 80
    ip_protocol = "tcp"
    cidr        = "0.0.0.0/0"
  }

  rule {
    from_port   = -1
    to_port     = -1
    ip_protocol = "icmp"
    cidr        = "0.0.0.0/0"
  }
}

resource "openstack_compute_floatingip_v2" "scb-terraform-floatingip" {
  pool       = "${var.pool}"
  depends_on = ["openstack_networking_router_interface_v2.scb-terraform-interface"]
}

resource "openstack_compute_instance_v2" "scb-terraform-compute" {
  name            = "scb-terraform-instance"
  image_name      = "${var.image}"
  flavor_name     = "${var.flavor}"
  key_pair        = "${openstack_compute_keypair_v2.terraform.name}"
  security_groups = ["${openstack_compute_secgroup_v2.scb-terraform-sec.name}"]

  network {
    uuid = "${openstack_networking_network_v2.scb-terraform-net.id}"
  }

}

resource "openstack_compute_floatingip_associate_v2" "scb-terraform-floatingip-associate" {
  floating_ip = "${openstack_compute_floatingip_v2.scb-terraform-floatingip.address}"
  instance_id = "${openstack_compute_instance_v2.scb-terraform-compute.id}"

}