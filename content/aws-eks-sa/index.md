---
emoji: 📖
title: AWS IAM과 Kubernetes Service Account의 통합
date: '2024-11-06 16:28:47'
author: 에디
categories: kotlin
---

## AWS IAM과 Kubernetes Service Account 통합

AWS IAM과 Kubernetes Service Account는 각각 AWS와 Kubernetes에서 권한을 관리하는 기능을 제공한다. 특히 EKS에서는 AWS IAM 역할(Role)을 Kubernetes Service Account와 연결해 AWS 리소스에 안전하게 접근할 수 있도록 설정할 수 있다. 여기서는 IAM과 Kubernetes에서의 역할 개념, 두 시스템 간의 통합(IRSA)을 통해 역할을 어떻게 연결할 수 있는지 정리했다.

---

### 1. AWS IAM (Identity and Access Management)
AWS IAM은 AWS 리소스에 대한 접근 권한을 관리하는 서비스로, `사용자(User)`, `그룹(Group)`, `정책(Policy)`, `역할(Role)`을 통해 접근 권한을 세부적으로 설정할 수 있다.

#### AWS IAM의 주요 개념
- **사용자(User)**: AWS 리소스에 접근 가능한 개별 엔터티로, 특정 API 호출 권한을 가질 수 있다.
- **그룹(Group)**: 여러 사용자를 하나의 그룹으로 묶어 공통 권한을 부여할 수 있다.
- **정책(Policy)**: JSON 형식으로 권한을 정의한 문서로, 특정 사용자, 그룹, 역할에 부착하여 접근 권한을 지정한다.
- **역할(Role)**: 특정 리소스에 대한 권한을 위임하는 가상의 엔터티로, 주로 서비스나 애플리케이션이 다른 AWS 서비스에 접근할 때 사용된다.

#### IAM 역할(Role)의 특징과 사용 사례
- **정의**: IAM Role은 특정 권한을 부여받은 가상의 엔터티이며, 자체 사용자나 암호 없이 정책(policy)을 통해서만 접근 권한을 가진다.
- **주요 사용 사례**:
  - **AWS 서비스 간 권한 위임**: 예를 들어, EC2 인스턴스가 S3 버킷에 접근할 수 있도록 EC2에 Role을 부여할 수 있다.
  - **크로스-계정 액세스**: 다른 AWS 계정의 리소스에 접근할 때 Role을 사용해 권한을 위임할 수 있다.
  - **EKS에서의 사용**: EKS 내의 Pod가 AWS 리소스(S3, DynamoDB 등)에 접근하도록 Kubernetes Service Account와 연결된 IAM Role을 사용할 수 있다.

#### IAM 정책(Policy) 예시
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```
위 정책은 S3 버킷 `my-bucket` 내의 모든 객체에 대해 `GetObject`, `PutObject` 권한을 부여한다. 이를 특정 역할(Role)에 연결해 사용자가 S3 버킷에 접근할 수 있게 설정할 수 있다.

---

### 2. Kubernetes Service Account
Kubernetes에서는 Pod 같은 클러스터 리소스가 Kubernetes API 서버에 접근할 수 있는 권한을 관리하기 위해 Service Account를 사용한다. 기본적으로 Kubernetes는 모든 Pod에 기본 Service Account를 연결하지만, 특정 Pod에 별도 권한을 부여하려면 개별적으로 Service Account를 생성해야 한다.

#### Kubernetes Service Account의 주요 개념
- **Service Account**: Kubernetes 클러스터 내에서 애플리케이션이나 서비스를 대신해 API 서버에 접근할 수 있는 계정이다. Pod에 특정 권한을 할당하려면 해당 Pod가 해당 Service Account를 사용하도록 설정해야 한다.
- **RBAC(Role-Based Access Control)**: Role이나 ClusterRole을 통해 Kubernetes 리소스에 대한 접근 권한을 제어하며, 이를 Service Account에 연결해 권한을 관리한다.

#### Role과 ClusterRole
- **Role**: 특정 네임스페이스 내에서 리소스 접근 권한을 부여하는 역할이다. 네임스페이스 내의 리소스에 대한 읽기/쓰기 권한을 세부적으로 제어할 수 있다.
- **ClusterRole**: 클러스터 전체에 걸쳐 적용할 수 있는 권한으로, 모든 네임스페이스에 접근해야 하는 리소스에 사용된다.
- **RoleBinding / ClusterRoleBinding**: Role 또는 ClusterRole을 특정 Service Account와 연결하여 해당 Service Account가 권한을 사용할 수 있도록 한다.

#### Role 예시
```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: my-namespace
  name: read-pods
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
```
위 Role은 `my-namespace` 네임스페이스에서 Pod에 대한 `get`, `list` 접근 권한을 부여한다. 이를 Service Account에 연결해 특정 Pod만 Pod 목록을 조회할 수 있게 할 수 있다.

---

### 3. AWS IAM과 Kubernetes Service Account의 통합 (IAM Role for Service Accounts, IRSA)
AWS EKS에서는 IAM과 Kubernetes의 Service Account를 통합해 Kubernetes Pod가 AWS 리소스에 안전하게 접근할 수 있도록 설정할 수 있다. 이를 가능하게 하는 것이 **IAM Role for Service Accounts (IRSA)**이다.

#### IRSA를 사용하는 이유
IRSA는 Kubernetes 내의 특정 Pod에 IAM 역할(Role)을 부여해 AWS 리소스 접근 권한을 관리한다. 이는 기존 방식(예: EC2 인스턴스에 직접 Role 부여)에 비해 보안이 강화된 방식으로, Pod에 대한 세부적인 IAM 권한 설정이 가능해 권한 남용을 방지할 수 있다.

#### IRSA 설정 방법
1. **IAM Role 생성**: `Trust Policy`에 EKS 클러스터에서 생성된 Service Account를 포함해 해당 역할이 특정 Service Account만 사용하도록 한다.
2. **Kubernetes Service Account 생성 및 IAM Role 연결**: Kubernetes에서 Service Account를 생성하고, IAM Role을 주석(annotation)으로 연결한다. 이 주석은 Pod가 시작될 때 해당 IAM Role을 자동으로 사용할 수 있게 한다.

#### Trust Policy 예시
IAM Role의 신뢰 정책을 작성해 특정 Kubernetes Service Account와 연동할 수 있다.
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE1234"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE1234:sub": "system:serviceaccount:my-namespace:my-service-account"
        }
      }
    }
  ]
}
```
위 정책은 EKS 클러스터에서 `my-namespace` 네임스페이스의 `my-service-account` 서비스 계정(Service Account)에서만 이 IAM 역할을 사용할 수 있도록 설정한다.

#### Kubernetes Service Account에 IAM Role 연결
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
  namespace: my-namespace
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/my-iam-role
```
이 예시는 `my-service-account`라는 Kubernetes Service Account에 `my-iam-role` 역할을 연결하는 방식이다. 이렇게 설정하면 해당 Service Account를 사용하는 Pod는 IAM Role의 권한을 통해 AWS 리소스에 접근할 수 있다.

---

- **IAM Role**: AWS 리소스 접근 권한을 위임하는 AWS IAM 역할.
- **Service Account**: Kubernetes에서 Pod가 API 서버나 다른 리소스에 접근할 수 있도록 권한을 부여하는 계정.
- **IRSA (IAM Role for Service Accounts)**: Kubernetes의 Service Account와 AWS IAM Role을 연결해 Kubernetes Pod가 AWS 리소스에 안전하게 접근할 수 있도록 하는 기능.

IRSA를 사용하면 EKS에서 실행 중인 애플리케이션이 안전하게 AWS 서비스(S3, DynamoDB 등)에 접근할 수 있다. 이를 통해 Pod 단위의 세밀한 권한 관리가 가능해지고, 클러스터 내 보안이 한층 강화된다.