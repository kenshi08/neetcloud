variable "image" {
  default = "ubuntu-16.04-server-cloudimg-amd64"
}

variable "flavor" {
  default = "m1.small"
}

variable "ssh_user_name" {
  default = "ubuntu"
}

variable "external_gateway" {
	default = "964b4aca-c084-4f95-91cb-689625f40220"
}

variable "pool" {
  default = "VLAN-930"
}

variable "ssh_key_file" {
  default = "~/.ssh/id_rsa.terraform"
}