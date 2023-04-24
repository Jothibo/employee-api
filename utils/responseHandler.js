const userHandler = (user) => {
  return {
    id: user._id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    email: user?.email,
    employeeId: user?.employeeId,
    role: user?.role,
    isActive: user?.isActive,
  };
};

module.exports = { userHandler };
